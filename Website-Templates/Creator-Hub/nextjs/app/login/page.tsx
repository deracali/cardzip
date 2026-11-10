import type { Metadata } from "next";
import CreatorAuthPage from "../../src/pages/CreatorAuthPage";

export const metadata: Metadata = {
  title: "Sign in — CreatorHub",
};

export default function Page() {
  return <CreatorAuthPage />;
}
