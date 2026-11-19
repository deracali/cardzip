"use client";

import { useParams } from "next/navigation";
import { ProductRoutePage } from "../../../src/page-components/PortfolioScreens";

export default function Page() {
  const params = useParams();
  return <ProductRoutePage slug={params.slug} />;
}
