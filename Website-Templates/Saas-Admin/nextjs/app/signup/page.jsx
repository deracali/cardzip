import { AuthRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "Create Your Workspace" };

export default function SignupPage() {
  return <AuthRoute signup />;
}
