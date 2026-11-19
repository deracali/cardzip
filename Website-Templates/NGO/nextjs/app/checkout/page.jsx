import CheckoutPage from "../../src/page-components/CheckoutPage";

export default async function Page({ searchParams }) {
  const values = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["amount", "frequency", "campaign"]) {
    const value = values?.[key];
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value) && typeof value[0] === "string") query.set(key, value[0]);
  }
  return <CheckoutPage searchParams={query.toString()} />;
}
