import { NextRequest, NextResponse } from "next/server";
import { carewellRequest, errorResponse, readJson, requirePatient } from "../../../../src/lib/carewell-api";

type Provider = "stripe" | "paystack";
type CheckoutBody = {
  provider?: Provider;
  doctorSlug?: string;
  appointmentType?: "online" | "in-person";
  startsAt?: string;
  timeLabel?: string;
};

type ValidCheckoutBody = CheckoutBody & {
  provider: Provider;
  doctorSlug: string;
  appointmentType: "online" | "in-person";
  startsAt: string;
  timeLabel: string;
};

function isValidBooking(body: CheckoutBody): body is ValidCheckoutBody {
  const date = new Date(body.startsAt || "");
  return ["stripe", "paystack"].includes(body.provider || "")
    && typeof body.doctorSlug === "string"
    && body.doctorSlug.length > 0
    && ["online", "in-person"].includes(body.appointmentType || "")
    && typeof body.timeLabel === "string"
    && body.timeLabel.length <= 20
    && !Number.isNaN(date.valueOf())
    && date > new Date();
}

export async function POST(request: NextRequest) {
  try {
    let body: CheckoutBody;
    try {
      body = await request.json() as CheckoutBody;
    } catch {
      return NextResponse.json({ error: "Request must contain valid JSON." }, { status: 400 });
    }
    if (!isValidBooking(body)) {
      return NextResponse.json({ error: "Choose an available appointment and payment method." }, { status: 400 });
    }

    const secret = body.provider === "stripe" ? process.env.STRIPE_SECRET_KEY : process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: `${body.provider === "stripe" ? "Stripe" : "Paystack"} is not configured.` }, { status: 503 });
    }
    if (!process.env.CAREWELL_PAYMENT_FULFILLMENT_SECRET) {
      return NextResponse.json({ error: "Paid appointment fulfillment is not configured on the API." }, { status: 503 });
    }

    const { user, error } = await requirePatient(request);
    if (error) return error;

    const doctorResponse = await carewellRequest(request, `/doctors/${encodeURIComponent(body.doctorSlug!)}`);
    const doctorResult = await readJson(doctorResponse);
    if (!doctorResponse.ok || !doctorResult.doctor) {
      return NextResponse.json({ error: doctorResult.error || "This doctor is not currently accepting appointments." }, { status: doctorResponse.status || 404 });
    }
    const doctor = doctorResult.doctor;
    if (!doctor.availability?.includes(body.timeLabel)) {
      return NextResponse.json({ error: "That appointment time is no longer available." }, { status: 400 });
    }
    const amount = Math.round(Number(doctor.fee) * 100);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "This doctor does not have a valid appointment fee." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const booking = {
      doctorSlug: doctor.slug,
      appointmentType: body.appointmentType,
      startsAt: new Date(body.startsAt!).toISOString(),
      timeLabel: body.timeLabel,
      patientId: user.id,
      patientEmail: user.email,
      patientName: user.name,
    };

    if (body.provider === "stripe") {
      const parameters = new URLSearchParams({
        mode: "payment",
        success_url: `${origin}/payment/callback?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/doctors/${encodeURIComponent(doctor.slug)}?payment=cancelled`,
        customer_email: user.email,
        client_reference_id: user.id,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": String(amount),
        "line_items[0][price_data][product_data][name]": `Carewell appointment with ${doctor.name}`,
        "line_items[0][quantity]": "1",
        "metadata[doctorSlug]": booking.doctorSlug,
        "metadata[appointmentType]": booking.appointmentType,
        "metadata[startsAt]": booking.startsAt,
        "metadata[timeLabel]": booking.timeLabel,
        "metadata[patientId]": booking.patientId,
        "metadata[patientEmail]": booking.patientEmail,
      });
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: parameters,
        cache: "no-store",
      });
      const result = await readJson(response);
      if (!response.ok || typeof result.url !== "string") {
        return NextResponse.json({ error: result.error?.message || "Stripe could not start checkout." }, { status: 502 });
      }
      return NextResponse.json({ url: result.url });
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount,
        currency: "USD",
        callback_url: `${origin}/payment/callback?provider=paystack`,
        metadata: booking,
      }),
      cache: "no-store",
    });
    const result = await readJson(response);
    if (!response.ok || !result.status || typeof result.data?.authorization_url !== "string") {
      return NextResponse.json({ error: result.message || "Paystack could not start checkout." }, { status: 502 });
    }
    return NextResponse.json({ url: result.data.authorization_url });
  } catch (error) {
    return errorResponse(error);
  }
}
