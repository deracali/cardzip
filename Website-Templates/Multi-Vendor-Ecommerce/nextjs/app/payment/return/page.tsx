import PaymentReturn from "../../../components/PaymentReturn";

type SearchParams = {
  provider?: string;
  reference?: string;
  trxref?: string;
  session_id?: string;
  order?: string;
  cancelled?: string;
};

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return <PaymentReturn
    provider={params.provider || ""}
    reference={params.reference || params.trxref || ""}
    sessionId={params.session_id || ""}
    orderNumber={params.order || ""}
    cancelled={params.cancelled === "1"}
  />;
}
