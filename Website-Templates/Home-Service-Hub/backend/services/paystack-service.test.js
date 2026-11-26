import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { createPaystackService } from "./paystack-service.js";

test("Paystack initializes a hosted USD checkout and verifies webhook signatures", async () => {
  let initializeRequest;
  const service = createPaystackService({
    secretKey: "sk_test_example",
    currency: "USD",
    callbackUrl: "https://fixflow.example/payment/return",
    production: true,
    fetchImpl: async (url, options) => {
      initializeRequest = { url, options };
      return {
        ok: true,
        json: async () => ({ status: true, data: { authorization_url: "https://checkout.paystack.com/checkout", reference: "fixflow-ref" } }),
      };
    },
  });
  const checkout = await service.initialize({
    email: "client@example.test",
    amount: 18900,
    reference: "fixflow-ref",
    metadata: { appointmentId: "request-1" },
  });
  assert.equal(checkout.authorizationUrl, "https://checkout.paystack.com/checkout");
  assert.equal(initializeRequest.url, "https://api.paystack.co/transaction/initialize");
  assert.equal(initializeRequest.options.headers.Authorization, "Bearer sk_test_example");
  assert.deepEqual(JSON.parse(initializeRequest.options.body), {
    email: "client@example.test",
    amount: 18900,
    currency: "USD",
    reference: "fixflow-ref",
    callback_url: "https://fixflow.example/payment/return",
    metadata: { appointmentId: "request-1" },
  });

  const rawBody = Buffer.from('{"event":"charge.success"}');
  const signature = createHmac("sha512", "sk_test_example").update(rawBody).digest("hex");
  assert.equal(service.verifyWebhookSignature(rawBody, signature), true);
  assert.equal(service.verifyWebhookSignature(rawBody, "a".repeat(128)), false);
});

test("Paystack refuses insecure checkout URLs and production callbacks", async () => {
  const invalidCallback = () => createPaystackService({
    secretKey: "sk_test_example",
    callbackUrl: "http://fixflow.example/payment/return",
    production: true,
  });
  assert.throws(invalidCallback, /HTTPS in production/);
  const service = createPaystackService({
    secretKey: "sk_test_example",
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ status: true, data: { authorization_url: "http://checkout.paystack.com/unsafe", reference: "ref" } }),
    }),
  });
  await assert.rejects(() => service.initialize({ email: "a@b.test", amount: 100, reference: "ref" }), /insecure checkout URL/);
});
