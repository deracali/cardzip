import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { createPaystackService } from "./paystack-service.js";

test("Paystack initializes NGN hosted checkout and validates webhook signatures", async () => {
  const secretKey = "sk_test_example_secret";
  const requests = [];
  const service = createPaystackService({
    secretKey,
    currency: "NGN",
    callbackUrl: "https://shop.example/payment/return",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      if (url.endsWith("/transaction/initialize")) {
        const body = JSON.parse(options.body);
        return {
          ok: true,
          json: async () => ({ status: true, data: { authorization_url: "https://checkout.paystack.com/example", reference: body.reference } }),
        };
      }
      return {
        ok: true,
        json: async () => ({ status: true, data: { status: "success", reference: "pay-example", amount: 2997, currency: "NGN" } }),
      };
    },
  });

  const checkout = await service.initialize({
    email: "customer@example.com",
    amount: 2997,
    reference: "pay-example",
    metadata: { orderId: "order-example" },
  });
  assert.deepEqual(checkout, {
    authorizationUrl: "https://checkout.paystack.com/example",
    reference: "pay-example",
  });
  const initializeBody = JSON.parse(requests[0].options.body);
  assert.equal(initializeBody.currency, "NGN");
  assert.equal(initializeBody.amount, 2997);
  assert.equal(initializeBody.callback_url, "https://shop.example/payment/return");
  assert.equal(requests[0].options.headers.Authorization, `Bearer ${secretKey}`);
  assert.equal((await service.verify("pay-example")).status, "success");

  const rawBody = Buffer.from('{"event":"charge.success"}');
  const signature = createHmac("sha512", secretKey).update(rawBody).digest("hex");
  assert.equal(service.verifyWebhookSignature(rawBody, signature), true);
  assert.equal(service.verifyWebhookSignature(rawBody, "a".repeat(128)), false);
});

test("Paystack refuses payment initialization without a backend secret", async () => {
  const service = createPaystackService({ secretKey: "", callbackUrl: "http://localhost:3000/payment/return" });
  assert.equal(service.isConfigured(), false);
  await assert.rejects(
    service.initialize({ email: "customer@example.com", amount: 100, reference: "pay-example" }),
    { status: 503 },
  );
});
