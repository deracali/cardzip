import type { Metadata } from "next";
import CreatorProfilePage from "../../src/pages/CreatorProfilePage";

export const metadata: Metadata = {
  title: "Maya Chen — CreatorHub",
};

export default function Page() {
  return <CreatorProfilePage />;
}
