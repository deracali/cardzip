import { AdminConsole, AnalyticsRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <AdminConsole active="/analytics">
      <AnalyticsRoute />
    </AdminConsole>
  );
}
