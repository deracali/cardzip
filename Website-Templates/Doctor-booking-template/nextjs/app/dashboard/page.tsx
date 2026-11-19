import type { Metadata } from "next";
import AppClient from "../AppClient";

export const metadata: Metadata = { title: "Patient dashboard | Carewell" };

export default function PatientDashboardPage() {
  return <AppClient />;
}