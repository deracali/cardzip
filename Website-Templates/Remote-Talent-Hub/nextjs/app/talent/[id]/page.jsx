import TalentDetailPage from "../../../src/page-components/TalentDetailPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <TalentDetailPage id={id} />;
}
