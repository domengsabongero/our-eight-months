import { SectionHeading } from "./SectionHeading";
import { StoryBlock } from "./StoryBlock";
import { STORY_PHOTOS } from "@/lib/story-photos";

export function DatesSection() {
  return (
    <section className="relative bg-cream-glow px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Our Favorite Dates"
          title="The little places we love"
        />

        <div className="mt-20 space-y-24 sm:mt-24 sm:space-y-32">
          <StoryBlock
            src={STORY_PHOTOS.cafe}
            alt="Our favorite coffee and cafe"
            eyebrow="Coffee & conversations"
            message="Some of my favorite conversations happened over coffee with you."
          />
          <StoryBlock
            reverse
            src={STORY_PHOTOS.maki}
            alt="The best maki ever, shared together"
            eyebrow="Every meal, better together"
            message="Every meal becomes unforgettable because I'm sharing it with you."
          />
        </div>
      </div>
    </section>
  );
}
