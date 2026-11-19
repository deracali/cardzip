import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { createPaymentService } from "./payment-service.js";

const order = {
  id: "order_test",
  orderNumber: "MH-TEST1234",
  userId: "client_test",
  paymentReference: "payment_test",
  total: 12.34,
  shippingAddress: { email: "buyer@example.test" },
};

function response(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

test("providers stay disabled unless secret and matching USD currency are configured", () => {
  const service = createPaymentService({ env: {} });
  assert.deepEqual(service.providers(), {
    currency: "USD",
    providers: [
      { id: "paystack", name: "Paystack", enabled: false },
      { id: "stripe", name: "Stripe", enabled: false },
    ],
  });
});

test("Paystack checkout uses server amount and verifies signed webhook payload", async () => {
  let initializeBody;
  const service = createPaymentService({
    env: { PAYSTACK_SECRET_KEY: "paystack_test_secret", PAYSTACK_CURRENCY: "USD" },
    fetchImpl: async (url, options) => {
      if (url.endsWith("/transaction/initialize")) {
        initializeBody = JSON.parse(options.body);
        return response({ status: true, data: { authorization_url: "https://checkout.paystack.com/test", reference: initializeBody.reference } });
      }
      return response({ status: true, data: { reference: order.paymentReference, status: "success", amount: 1234, currency: "USD", metadata: { orderId: order.id } } });
    },
  });

  const checkout = await service.initialize({ provider: "paystack", order, returnUrl: "https://shop.example.test/payment/return" });
  assert.equal(checkout.checkoutUrl, "https://checkout.paystack.com/test");
  assert.equal(initializeBody.amount, 1234);
  assert.equal(initializeBody.currency, "USD");
  assert.equal(initializeBody.reference, order.paymentReference);
  assert.equal((await service.verifyPaystack(order.paymentReference)).amount, 1234);

  const body = Buffer.from(JSON.stringify({ event: "charge.success" }));
  const signature = createHmac("sha512", "paystack_test_secret").update(body).digest("hex");
  assert.equal(service.verifyPaystackWebhook(body, signature).event, "charge.success");
  assert.throws(() => service.verifyPaystackWebhook(body, "0".repeat(128)), /signature is invalid/);
});

test("Stripe checkout uses USD cents and rejects stale or invalid webhook signatures", async () => {
  let stripeBody;
  const clock = () => 1_700_000_000_000;
  const service = createPaymentService({
    env: {
      STRIPE_SECRET_KEY: "sk_test_market",
      STRIPE_CURRENCY: "USD",
      STRIPE_WEBHOOK_SECRET: "whsec_market",
    },
    clock,
    fetchImpl: async (url, options) => {
      stripeBody = new URLSearchParams(options.body);
      return response({ id: "cs_test_market", url: "https://checkout.stripe.com/test" });
    },
  });

  const checkout = await service.initialize({ provider: "stripe", order, returnUrl: "https://shop.example.test/payment/return?provider=stripe" });
  assert.equal(checkout.sessionId, "cs_test_market");
  assert.equal(stripeBody.get("line_items[0][price_data][unit_amount]"), "1234");
  assert.equal(stripeBody.get("line_items[0][price_data][currency]"), "usd");
  assert.equal(stripeBody.get("metadata[orderId]"), order.id);

  const body = Buffer.from(JSON.stringify({ type: "checkout.session.completed" }));
  const timestamp = Math.floor(clock() / 1000);
  const signature = createHmac("sha256", "whsec_market").update(`${timestamp}.`).update(body).digest("hex");
  assert.equal(service.verifyStripeWebhook(body, `t=${timestamp},v1=${signature}`).type, "checkout.session.completed");
  assert.throws(() => service.verifyStripeWebhook(body, `t=${timestamp - 301},v1=${signature}`), /signature is invalid/);
  assert.throws(() => service.verifyStripeWebhook(body, `t=${timestamp},v1=${"0".repeat(64)}`), /signature is invalid/);
});
