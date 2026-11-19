import { SearchPage } from "../../src/page-components/PortfolioScreens";

export default async function Page({ searchParams }) {
  const params = await searchParams;
  return <SearchPage query={typeof params?.q === "string" ? params.q : ""} />;
}
