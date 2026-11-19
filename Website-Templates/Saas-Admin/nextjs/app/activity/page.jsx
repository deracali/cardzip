import { AdminConsole, ActivityRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "Workspace Activity" };

export default function ActivityPage() {
  return (
    <AdminConsole active="/activity">
      <ActivityRoute />
    </AdminConsole>
  );
}
