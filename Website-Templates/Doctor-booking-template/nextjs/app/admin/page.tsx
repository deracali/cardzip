import type { Metadata } from "next";
import AppClient from "../AppClient";

export const metadata: Metadata = { title: "Carewell administration" };

export default function AdminPage() {
  return <AppClient />;
}