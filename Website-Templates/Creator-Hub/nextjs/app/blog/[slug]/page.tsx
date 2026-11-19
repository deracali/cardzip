import SiteContentPage from '../../../src/pages/SiteContentPage'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <SiteContentPage page="article" slug={slug} />
}
