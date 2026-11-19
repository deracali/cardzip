"use client";

import { useParams } from "next/navigation";
import CampaignPage from "../../../src/page-components/CampaignPage";
import InfoPage from "../../../src/page-components/InfoPage";
import { campaigns } from "../../../src/data/campaigns";

export default function Page() {
  const { slug } = useParams();
  const campaign = campaigns.find((item) => item.slug === slug);
  return campaign ? <CampaignPage campaign={campaign} /> : <InfoPage page="impact" />;
}
