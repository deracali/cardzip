import type { Metadata } from "next";
import AppClient from "../../AppClient";

export const metadata: Metadata = { title: "Carewell admin sign in" };

export default function AdminLoginPage() {
  return <AppClient />;
}