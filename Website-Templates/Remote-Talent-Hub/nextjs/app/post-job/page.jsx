import { EmployerJobForm } from "../../src/components/MarketplaceForms";

export default async function Page({ searchParams }) {
  const query = await searchParams;
  return <EmployerJobForm initialPlan={typeof query?.plan === "string" ? query.plan : "standard"} />;
}
