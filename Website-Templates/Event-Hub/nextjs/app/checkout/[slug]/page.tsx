import EventCheckout from "../../../components/EventCheckout";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventCheckout slug={slug} />;
}
