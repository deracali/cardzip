"use client";

import dynamic from "next/dynamic";
import { technicianApi } from "../services/technicianApi.js";

const TechnicianApp = dynamic(() => import("../TechnicianApp"), { ssr: false });

export default function TechnicianClient() {
  return <TechnicianApp api={technicianApi} />;
}
