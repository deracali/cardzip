import type { Metadata } from "next";
import AdminApp from "../../../src/AdminApp.jsx";

export const metadata: Metadata = {
  title: "Admin sign in | Digital Asset Hub",
};

export default function AdminLoginPage() {
  return <AdminApp />;
}