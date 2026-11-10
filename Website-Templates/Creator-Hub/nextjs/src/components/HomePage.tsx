import CreatorFeatures from "./CreatorFeatures";
import CreatorHero from "./CreatorHero";
import CreatorPricing from "./CreatorPricing";
import CreatorStories from "./CreatorStories";
import CreatorHubFooter from "./CreatorHubFooter";
import CreatorHubHeader from "./CreatorHubHeader";

export default function HomePage() {
  return (
    <div className="creator-hub">
      <CreatorHubHeader />
      <main>
        <CreatorHero />
        <CreatorFeatures />
        <CreatorStories />
        <CreatorPricing />
      </main>
      <CreatorHubFooter />
    </div>
  );
}
