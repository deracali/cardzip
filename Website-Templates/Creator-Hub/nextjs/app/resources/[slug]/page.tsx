import CreatorInfoPage from "../../../src/pages/CreatorInfoPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CreatorInfoPage page="article" slug={slug} />;
}
