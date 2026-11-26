import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { createPaystackService } from "./paystack.js";

test("Paystack initializes USD checkout in minor units and verifies webhook signatures", async () => {
  const calls = [];
  const service = createPaystackService({
    secretKey: "sk_test_kindred",
    currency: "USD",
    callbackUrl: "https://kindred.example/payment/callback",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (url.endsWith("/transaction/initialize")) {
        const request = JSON.parse(options.body);
        return {
          ok: true,
          async json() {
            return { status: true, data: { authorization_url: "https://checkout.paystack.com/example", reference: request.reference } };
          },
        };
      }
      return {
        ok: true,
        async json() {
          return { status: true, data: { status: "success", reference: "kindred_ref", amount: 2550, currency: "USD" } };
        },
      };
    },
  });

  const checkout = await service.initializeTransaction({
    email: "donor@example.test",
    amount: 25.5,
    reference: "kindred_ref",
    metadata: { donationId: "pledge_1", userId: "user_1" },
  });
  assert.equal(checkout.reference, "kindred_ref");
  assert.equal(checkout.authorizationUrl, "https://checkout.paystack.com/example");
  assert.equal(calls[0].url, "https://api.paystack.co/transaction/initialize");
  assert.equal(calls[0].options.headers.Authorization, "Bearer sk_test_kindred");
  assert.equal(JSON.parse(calls[0].options.body).amount, 2550);
  assert.equal(JSON.parse(calls[0].options.body).currency, "USD");
  assert.equal(JSON.parse(calls[0].options.body).callback_url, "https://kindred.example/payment/callback");
  assert.equal((await service.verifyTransaction("kindred_ref")).amount, 2550);

  const rawBody = Buffer.from('{"event":"charge.success"}');
  const signature = createHmac("sha512", "sk_test_kindred").update(rawBody).digest("hex");
  assert.equal(service.verifyWebhookSignature(rawBody, signature), true);
  assert.equal(service.verifyWebhookSignature(rawBody, "invalid"), false);
});

test("Paystack operations clearly fail when the backend secret is unset", () => {
  const service = createPaystackService({ secretKey: "" });
  assert.throws(() => service.assertConfigured(), { status: 503 });
});
