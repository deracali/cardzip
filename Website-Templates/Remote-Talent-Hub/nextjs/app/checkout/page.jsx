import CheckoutPage from "../../src/page-components/CheckoutPage";

export default async function Page({ searchParams }) {
  const query = await searchParams;
  return <CheckoutPage
    planId={typeof query?.plan === "string" ? query.plan : "featured"}
    jobTitle={typeof query?.job === "string" ? query.job : "New remote job"}
    jobId={typeof query?.jobId === "string" ? query.jobId : ""}
    paymentReference={typeof query?.reference === "string" ? query.reference : ""}
  />;
}
