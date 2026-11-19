import SalonAuthForm from "../../../components/SalonAuthForm";

export default function AdminLoginPage() {
  return <SalonAuthForm mode="login" expectedRole="admin" />;
}
