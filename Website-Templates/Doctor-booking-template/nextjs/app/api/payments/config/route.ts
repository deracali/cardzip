import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const canFulfill = Boolean(process.env.CAREWELL_PAYMENT_FULFILLMENT_SECRET);
  return NextResponse.json({
    stripe: canFulfill && Boolean(process.env.STRIPE_SECRET_KEY),
    paystack: canFulfill && Boolean(process.env.PAYSTACK_SECRET_KEY),
  });
}
