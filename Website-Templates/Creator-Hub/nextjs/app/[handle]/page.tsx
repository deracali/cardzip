import CreatorPublicPage from "../../src/pages/CreatorPublicPage";

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return <CreatorPublicPage handle={handle} />;
}
