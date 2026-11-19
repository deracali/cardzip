import type { Metadata } from "next";
import CreatorPublicPage from "../../src/pages/CreatorPublicPage";

export const metadata: Metadata = {
  title: "Maya Chen — CreatorHub",
};

export default function Page() {
  return <CreatorPublicPage handle="maya-chen" />;
}
