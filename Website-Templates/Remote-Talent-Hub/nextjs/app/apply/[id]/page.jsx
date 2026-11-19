import { JobApplicationForm } from "../../../src/components/MarketplaceForms";
import { getJob } from "../../../src/data/marketplace";

export default async function Page({ params }) {
  const { id } = await params;
  const job = getJob(id);
  return <JobApplicationForm id={id} initialJobTitle={job?.title || ""} />;
}
