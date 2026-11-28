import { httpError, safeJob } from "../utils/http.js";

const plans = {
  standard: { priceUsd: 99 },
  featured: { priceUsd: 249 },
};
const exchangeRateUrl = "https://open.er-api.com/v6/latest/USD";
const paystackBaseUrl = "https://api.paystack.co";

export function createPaymentController({
  store,
  fetchImpl = fetch,
  paystackSecret = process.env.PAYSTACK_SECRET_KEY,
  callbackUrl = process.env.PAYSTACK_CALLBACK_URL,
  now = () => Date.now(),
}) {
  let cachedRate;
  let cachedAt = 0;
  let rateRequest;

  async function getUsdToNgnRate() {
    if (cachedRate && now() - cachedAt < 10 * 60 * 1000) return cachedRate;
    if (!rateRequest) {
      rateRequest = (async () => {
        let response;
        try {
          response = await fetchImpl(exchangeRateUrl, { signal: AbortSignal.timeout(10000) });
        } catch {
          throw httpError(503, "Could not retrieve the live USD to NGN rate. Please try again.");
        }
        const result = await response.json().catch(() => null);
        const rate = result?.rates?.NGN;
        if (!response.ok || result?.result !== "success" || !Number.isFinite(rate) || rate <= 0) {
          throw httpError(503, "Could not retrieve the live USD to NGN rate. Please try again.");
        }
        cachedRate = { rate, updatedAt: result.time_last_update_utc || null };
        cachedAt = now();
        return cachedRate;
      })().finally(() => {
        rateRequest = null;
      });
    }
    return rateRequest;
  }

  async function requestPaystack(path, options = {}) {
    if (!paystackSecret) throw httpError(503, "Paystack is not configured on the server.");
    let response;
    try {
      response = await fetchImpl(`${paystackBaseUrl}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw httpError(502, "Could not connect to Paystack. Please try again.");
    }
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.status !== true) {
      throw httpError(502, result?.message || "Paystack could not complete the request.");
    }
    return result.data;
  }

  return {
    quote: async (request, response, next) => {
      try {
        const plan = plans[request.query.plan];
        if (!plan) throw httpError(400, "Choose a valid job listing plan.");
        const { rate, updatedAt } = await getUsdToNgnRate();
        response.json({
          plan: request.query.plan,
          baseCurrency: "USD",
          baseAmount: plan.priceUsd,
          currency: "NGN",
          amount: Math.round(plan.priceUsd * rate),
          exchangeRate: rate,
          rateUpdatedAt: updatedAt,
        });
      } catch (error) {
        next(error);
      }
    },

    initialize: async (request, response, next) => {
      try {
        const { jobId, plan: planId } = request.body || {};
        const plan = plans[planId];
        if (typeof jobId !== "string" || !jobId.trim()) throw httpError(400, "A job listing is required.");
        if (!plan) throw httpError(400, "Choose a valid job listing plan.");
        if (!callbackUrl) throw httpError(503, "PAYSTACK_CALLBACK_URL is not configured on the server.");

        const job = await store.findJobById(jobId);
        if (!job || job.ownerId !== request.user.id) throw httpError(404, "Job listing not found.");
        if (job.plan !== planId) throw httpError(409, "The selected plan does not match this job listing.");
        if (job.paymentStatus === "paid") throw httpError(409, "This job listing has already been paid for.");
        if (!["pending_review", "approved"].includes(job.status)) {
          throw httpError(409, "Only pending or approved job listings can be paid for.");
        }
        if (job.paymentReference) {
          if (!job.paymentAuthorizationUrl || !job.paymentQuoteKobo) {
            throw httpError(409, "A payment is already in progress for this listing.");
          }
          response.json({
            reference: job.paymentReference,
            authorizationUrl: job.paymentAuthorizationUrl,
            amount: job.paymentQuoteKobo / 100,
            currency: job.paymentCurrency,
          });
          return;
        }

        const { rate } = await getUsdToNgnRate();
        const amount = Math.round(plan.priceUsd * rate);
        const amountKobo = amount * 100;
        let callback;
        try {
          callback = new URL(callbackUrl);
        } catch {
          throw httpError(503, "PAYSTACK_CALLBACK_URL must be a valid URL.");
        }
        if (callback.protocol !== "https:" && callback.hostname !== "localhost" && callback.hostname !== "127.0.0.1") {
          throw httpError(503, "PAYSTACK_CALLBACK_URL must use HTTPS.");
        }
        callback.searchParams.set("jobId", String(job.id));
        callback.searchParams.set("plan", planId);

        const result = await requestPaystack("/transaction/initialize", {
          method: "POST",
          body: JSON.stringify({
            email: request.user.email,
            amount: amountKobo,
            currency: "NGN",
            callback_url: callback.toString(),
            metadata: {
              jobId: String(job.id),
              userId: String(request.user.id),
              plan: planId,
              amountKobo,
              exchangeRate: rate,
            },
          }),
        });
        if (!result?.reference || !result?.authorization_url) {
          throw httpError(502, "Paystack returned an incomplete checkout response.");
        }

        const updatedJob = await store.updateJob(job.id, {
          paymentReference: result.reference,
          paymentAuthorizationUrl: result.authorization_url,
          paymentQuoteKobo: amountKobo,
          paymentCurrency: "NGN",
          paymentExchangeRate: rate,
        });
        if (!updatedJob) throw httpError(404, "Job listing not found.");

        response.json({
          reference: result.reference,
          authorizationUrl: result.authorization_url,
          amount,
          currency: "NGN",
        });
      } catch (error) {
        next(error);
      }
    },

    verify: async (request, response, next) => {
      try {
        const reference = typeof request.query.reference === "string" ? request.query.reference.trim() : "";
        if (!reference || reference.length > 120) throw httpError(400, "A valid Paystack reference is required.");
        const transaction = await requestPaystack(`/transaction/verify/${encodeURIComponent(reference)}`);
        if (transaction?.status !== "success" || transaction.reference !== reference) {
          throw httpError(402, "Paystack has not confirmed this payment.");
        }

        let metadata = transaction.metadata;
        if (typeof metadata === "string") {
          try {
            metadata = JSON.parse(metadata);
          } catch {
            throw httpError(400, "Paystack returned invalid payment metadata.");
          }
        }
        const jobId = typeof metadata?.jobId === "string" ? metadata.jobId : "";
        const job = jobId ? await store.findJobById(jobId) : null;
        if (!job || job.ownerId !== request.user.id || metadata?.userId !== request.user.id) {
          throw httpError(404, "Payment does not match a job listing in your account.");
        }
        if (job.paymentReference !== reference) {
          if (job.paymentStatus === "paid") throw httpError(409, "This payment reference is no longer active.");
          throw httpError(409, "This payment reference is not active for the job listing.");
        }
        if (
          transaction.currency !== "NGN"
          || transaction.amount !== job.paymentQuoteKobo
          || Number(metadata?.amountKobo) !== job.paymentQuoteKobo
          || metadata?.plan !== job.plan
        ) {
          throw httpError(400, "The verified Paystack amount or plan does not match this listing.");
        }

        if (job.paymentStatus !== "paid") {
          const updatedJob = await store.updateJob(job.id, {
            paymentStatus: "paid",
            paymentAuthorizationUrl: "",
            paidAt: new Date().toISOString(),
          });
          if (!updatedJob) throw httpError(404, "Job listing not found.");
          response.json({ status: "paid", job: safeJob(updatedJob) });
          return;
        }
        response.json({ status: "paid", job: safeJob(job) });
      } catch (error) {
        next(error);
      }
    },
  };
}
