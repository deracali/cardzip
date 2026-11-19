import { AdminConsole, DashboardRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <AdminConsole active="/dashboard">
      <DashboardRoute />
    </AdminConsole>
  );
}
