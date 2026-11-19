import { AdminConsole, CheckoutRoute } from "../../src/components/SaasAdminUI";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <AdminConsole active="/checkout">
      <CheckoutRoute />
    </AdminConsole>
  );
}
