import CreatorHubHeader from "../../src/components/CreatorHubHeader";
import CreatorPricing from "../../src/components/CreatorPricing";
import CreatorHubFooter from "../../src/components/CreatorHubFooter";

export default function Page() {
  return (
    <div className="creator-hub">
      <CreatorHubHeader />
      <main><CreatorPricing /></main>
      <CreatorHubFooter />
    </div>
  );
}
