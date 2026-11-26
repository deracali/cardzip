export const paymentCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || "NGN";
const locale = paymentCurrency === "NGN" ? "en-NG" : "en";

const formatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: paymentCurrency,
});

export function formatMoney(value: number) {
  return formatter.format(value || 0);
}
