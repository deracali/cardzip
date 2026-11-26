import PaymentCallbackPage from "../../../src/page-components/PaymentCallbackPage";

export default async function Page({ searchParams }) {
  const values = await searchParams;
  const reference = typeof values?.reference === "string"
    ? values.reference
    : typeof values?.trxref === "string" ? values.trxref : "";
  return <PaymentCallbackPage reference={reference} />;
}
