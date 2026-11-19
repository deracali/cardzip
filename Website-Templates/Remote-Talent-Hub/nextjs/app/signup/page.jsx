import AuthForm from "../../src/components/AuthForm";

export default async function Page({ searchParams }) {
  const query = await searchParams;
  return <AuthForm
    signup
    defaultRole={query?.role === "employer" ? "employer" : "candidate"}
    redirectTo={typeof query?.next === "string" ? query.next : ""}
  />;
}
