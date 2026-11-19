import { AdminConsole, BillingRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "Billing & Invoices" };

export default function BillingPage() {
  return (
    <AdminConsole active="/billing">
      <BillingRoute />
    </AdminConsole>
  );
}
