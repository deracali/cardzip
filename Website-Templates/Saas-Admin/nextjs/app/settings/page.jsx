import { AdminConsole, SettingsRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <AdminConsole active="/settings">
      <SettingsRoute />
    </AdminConsole>
  );
}
