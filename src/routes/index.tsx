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

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const scrollToStory = useCallback(() => {
    document.getElementById("story")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <main className="relative bg-cream-glow">
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
    </main>
  );
}
