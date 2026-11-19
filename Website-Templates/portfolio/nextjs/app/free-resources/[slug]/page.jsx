"use client";

import { useParams } from "next/navigation";
import { FreeResourceRoutePage } from "../../../src/page-components/PortfolioScreens";

export default function Page() {
  const params = useParams();
  return <FreeResourceRoutePage slug={params.slug} />;
}
