"use client";

import { useParams } from "next/navigation";
import { NewsletterIssueRoutePage } from "../../../src/page-components/PortfolioScreens";

export default function Page() {
  const params = useParams();
  return <NewsletterIssueRoutePage slug={params.slug} />;
}
