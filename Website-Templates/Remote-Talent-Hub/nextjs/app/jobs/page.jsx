import JobsPage from "../../src/page-components/JobsPage";

export default async function Page({ searchParams }) {
  const query = await searchParams;
  return <JobsPage initialQuery={typeof query?.q === "string" ? query.q : ""} />;
}
