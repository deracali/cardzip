import ClientPage from "../../../src/components/ClientPage";

export default async function ReservationPage({ params }) {
  const { slug } = await params;
  return <ClientPage page="booking" slug={slug} />;
}
