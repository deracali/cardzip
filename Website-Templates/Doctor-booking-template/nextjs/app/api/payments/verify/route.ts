import { NextRequest, NextResponse } from "next/server";
import { carewellRequest, errorResponse, readJson, requirePatient } from "../../../../src/lib/carewell-api";

function parseBooking(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata || typeof metadata.doctorSlug !== "string"
    || !["online", "in-person"].includes(String(metadata.appointmentType))
    || typeof metadata.startsAt !== "string" || typeof metadata.timeLabel !== "string") {
    return null;
  }
  const startsAt = new Date(metadata.startsAt);
  if (Number.isNaN(startsAt.valueOf())) return null;
  return {
    doctorSlug: metadata.doctorSlug,
    appointmentType: metadata.appointmentType as "online" | "in-person",
    startsAt: startsAt.toISOString(),
    timeLabel: metadata.timeLabel,
  };
}

export async function GET(request: NextRequest) {
  try {
    const parameters = new URL(request.url).searchParams;
    const provider = parameters.get("provider");
    const secret = provider === "stripe" ? process.env.STRIPE_SECRET_KEY : provider === "paystack" ? process.env.PAYSTACK_SECRET_KEY : null;
    const reference = provider === "stripe" ? parameters.get("session_id") : parameters.get("reference");
    if (!secret || !process.env.CAREWELL_PAYMENT_FULFILLMENT_SECRET) {
      return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
    }
    if (!reference || reference.length > 200) {
      return NextResponse.json({ error: "A valid payment reference is required." }, { status: 400 });
    }

    const { user, error } = await requirePatient(request);
    if (error) return error;

    let metadata: Record<string, unknown> | null = null;
    let amount = 0;
    let currency = "";
    let paid = false;

    if (provider === "stripe") {
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      });
      const result = await readJson(response);
      if (!response.ok) return NextResponse.json({ error: result.error?.message || "Stripe could not verify this checkout." }, { status: 502 });
      metadata = result.metadata;
      amount = result.amount_total;
      currency = result.currency?.toUpperCase();
      paid = result.status === "complete" && result.payment_status === "paid"
        && result.client_reference_id === user.id
        && metadata?.patientId === user.id
        && result.customer_email?.toLowerCase() === user.email?.toLowerCase();
    } else if (provider === "paystack") {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      });
      const result = await readJson(response);
      if (!response.ok || !result.status) {
        return NextResponse.json({ error: result.message || "Paystack could not verify this transaction." }, { status: 502 });
      }
      metadata = typeof result.data?.metadata === "string"
        ? JSON.parse(result.data.metadata)
        : result.data?.metadata;
      amount = result.data?.amount;
      currency = result.data?.currency?.toUpperCase();
      paid = result.data?.status === "success" && result.data?.customer?.email?.toLowerCase() === user.email?.toLowerCase()
        && metadata?.patientId === user.id;
    } else {
      return NextResponse.json({ error: "Unsupported payment provider." }, { status: 400 });
    }

    const booking = parseBooking(metadata);
    if (!paid || !booking) {
      return NextResponse.json({ error: "This payment is not complete or does not belong to your account." }, { status: 409 });
    }
    const doctorResponse = await carewellRequest(request, `/doctors/${encodeURIComponent(booking.doctorSlug)}`);
    const doctorResult = await readJson(doctorResponse);
    if (!doctorResponse.ok || !doctorResult.doctor) {
      return NextResponse.json({ error: "The doctor on this payment could not be verified." }, { status: 409 });
    }
    const expectedAmount = Math.round(Number(doctorResult.doctor.fee) * 100);
    if (currency !== "USD" || amount !== expectedAmount) {
      return NextResponse.json({ error: "The payment amount does not match the appointment fee." }, { status: 409 });
    }

    const fulfillmentSecret = process.env.CAREWELL_PAYMENT_FULFILLMENT_SECRET;
    const appointmentResponse = await carewellRequest(request, "/appointments/paid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-carewell-payment-secret": fulfillmentSecret!,
      },
      body: JSON.stringify({ ...booking, paymentProvider: provider, paymentReference: reference }),
    });
    const appointmentResult = await readJson(appointmentResponse);
    if (!appointmentResponse.ok) {
      return NextResponse.json({ error: appointmentResult.error || "The paid appointment could not be created." }, { status: appointmentResponse.status });
    }
    return NextResponse.json({ appointment: appointmentResult.appointment });
  } catch (error) {
    return errorResponse(error);
  }
}
