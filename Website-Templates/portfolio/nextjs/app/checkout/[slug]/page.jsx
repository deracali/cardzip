"use client";

import { useParams } from "next/navigation";
import { CheckoutRoutePage } from "../../../src/page-components/PortfolioScreens";

export default function Page() {
  const params = useParams();
  return <CheckoutRoutePage slug={params.slug} />;
}
