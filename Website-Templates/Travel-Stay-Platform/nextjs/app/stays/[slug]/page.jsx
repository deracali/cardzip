import ClientPage from "../../../src/components/ClientPage";

export default async function StayDetailsPage({ params }) {
  const { slug } = await params;
  return <ClientPage page="stayDetail" slug={slug} />;
}
