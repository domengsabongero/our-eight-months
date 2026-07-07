import { SectionHeading } from "./SectionHeading";
import { StoryBlock } from "./StoryBlock";

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
            src="/images/4_DatePhoto_FavCoffee_and_Cafe.jpg"
            alt="Our favorite coffee and cafe"
            eyebrow="Coffee & conversations"
            message="Some of my favorite conversations happened over coffee with you."
          />
          <StoryBlock
            reverse
            src="/images/5_DatePhoto_BestEver_Maki_EVER.jpg"
            alt="The best maki ever, shared together"
            eyebrow="Every meal, better together"
            message="Every meal becomes unforgettable because I'm sharing it with you."
          />
        </div>
      </div>
    </section>
  );
}
