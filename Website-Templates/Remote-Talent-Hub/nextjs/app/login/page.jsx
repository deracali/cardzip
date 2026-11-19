import AuthForm from "../../src/components/AuthForm";

export default async function Page({ searchParams }) {
  const query = await searchParams;
  return <AuthForm
    defaultRole={query?.role === "employer" ? "employer" : "candidate"}
    redirectTo={typeof query?.next === "string" ? query.next : ""}
  />;
}
