import { AdminConsole, LogsRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "System Logs" };

export default function SystemLogsPage() {
  return (
    <AdminConsole active="/system-logs">
      <LogsRoute />
    </AdminConsole>
  );
}
