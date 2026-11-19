import ClientPage from "../../src/components/ClientPage";

export default async function TravelStayRoute({ params }) {
  const { slug } = await params;
  return <ClientPage page="explore" title="Page not found" description={`We couldn’t find “${slug.join("/")}”. Explore our stays and find somewhere wonderful.`} />;
}
