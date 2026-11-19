import { notFound } from "next/navigation";
import InformationPage from "../../src/page-components/InformationPage";

const supportedPages = new Set(["about", "contact", "privacy", "terms", "security", "reset-password"]);

export default async function Page({ params }) {
  const { slug } = await params;
  if (!supportedPages.has(slug)) notFound();
  return <InformationPage slug={slug} />;
}
