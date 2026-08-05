import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { FloatingHearts } from "@/components/effects/FloatingHearts";
import { Particles } from "@/components/effects/Particles";
import { Hero } from "@/components/love/Hero";
import { MomentsSection } from "@/components/love/MomentsSection";
import { DatesSection } from "@/components/love/DatesSection";
import { FunnySection } from "@/components/love/FunnySection";
import { JourneySection } from "@/components/love/JourneySection";
import { ReasonsSection } from "@/components/love/ReasonsSection";
import { LetterSection } from "@/components/love/LetterSection";
import { FinaleSection } from "@/components/love/FinaleSection";
import { Footer } from "@/components/love/Footer";

export const Route = createFileRoute("/_authenticated/story")({
  head: () => ({
    meta: [
      { title: "Our Story — The Keepsake" },
      {
        name: "description",
        content:
          "The interactive 8th monthsary love letter — eight months of smiles, laughter and memories.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Our Story — The Keepsake" },
      {
        property: "og:description",
        content: "Eight months of smiles, laughter and memories, told as a story.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoryPage,
});

function StoryPage() {
  const scrollToStory = useCallback(() => {
    document.getElementById("story")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="relative -mb-24 bg-cream-glow sm:mb-0">
      <ScrollProgress />
      <Particles count={26} />
      <FloatingHearts count={12} />

      <div className="relative z-10">
        <Hero onBegin={scrollToStory} />
        <MomentsSection />
        <DatesSection />
        <FunnySection />
        <JourneySection />
        <ReasonsSection />
        <LetterSection />
        <FinaleSection />
        <Footer />
      </div>
    </div>
  );
}
