import { AuthRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "Admin Portal Login" };

export default function LoginPage() {
  return <AuthRoute signup={false} />;
}
