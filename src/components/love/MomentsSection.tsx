import { SectionHeading } from "./SectionHeading";
import { StoryBlock } from "./StoryBlock";

export function MomentsSection() {
  return (
    <section id="story" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Every Moment With You" title="Happiness, beside me" />

        <div className="mt-20 space-y-24 sm:mt-24 sm:space-y-32">
          <StoryBlock
            src="/images/2_CuteSelfie.jpg"
            alt="A candid, happy selfie of us"
            message="Every day with you reminds me that happiness isn't found in places — it's found in the person beside you."
          />
          <StoryBlock
            reverse
            src="/images/3_CuteSelfie.jpg"
            alt="Maxine smiling"
            message="Your smile has become my favorite view."
          />
        </div>
      </div>
    </section>
  );
}
