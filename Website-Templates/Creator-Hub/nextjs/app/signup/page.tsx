import type { Metadata } from "next";
import CreatorAuthPage from "../../src/pages/CreatorAuthPage";

export const metadata: Metadata = {
  title: "Claim your creator link — CreatorHub",
};

export default function Page() {
  return <CreatorAuthPage signUp />;
}
