import type { Metadata } from "next";
import AdminApp from "../../src/AdminApp.jsx";

export const metadata: Metadata = {
  title: "Admin console | Digital Asset Hub",
};

export default function AdminPage() {
  return <AdminApp />;
}