import { AdminConsole, UsersRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "User Management" };

export default function UsersPage() {
  return (
    <AdminConsole active="/users">
      <UsersRoute />
    </AdminConsole>
  );
}
