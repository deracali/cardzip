import JobDetailPage from "../../../src/page-components/JobDetailPage";
import { getJob } from "../../../src/data/marketplace";

export default async function Page({ params }) {
  const { id } = await params;
  return <JobDetailPage id={id} initialJob={getJob(id)} />;
}
