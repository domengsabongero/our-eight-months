import { FadeUp } from "./FadeUp";
import { ParallaxPhoto } from "./ParallaxPhoto";
import { SectionHeading } from "./SectionHeading";
import { STORY_PHOTOS } from "@/lib/story-photos";

function JourneyBlock({
  src,
  alt,
  title,
  lines,
  reverse = false,
}: {
  src: string;
  alt: string;
  title: string;
  lines: string[];
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <FadeUp>
        <ParallaxPhoto src={src} alt={alt} className="aspect-[4/5] w-full" />
      </FadeUp>
      <FadeUp delay={0.15} className={reverse ? "md:text-right" : ""}>
        <h3 className="text-gradient-rose text-3xl font-medium sm:text-4xl">{title}</h3>
        <div className="mt-6 space-y-2">
          {lines.map((line, i) => (
            <p
              key={i}
              className="text-pretty font-serif text-xl leading-relaxed text-ink sm:text-2xl"
            >
              {line}
            </p>
          ))}
        </div>
      </FadeUp>
    </div>
  );
}

export function JourneySection() {
  return (
    <section className="relative bg-cream-glow px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Our Journey" title="How far we've come" />

        <div className="mt-20 space-y-24 sm:mt-24 sm:space-y-32">
          <JourneyBlock
            src={STORY_PHOTOS.firstOuting}
            alt="Our first ever outing"
            title="Where It All Started"
            lines={[
              "Looking back at this day still makes me smile.",
              "I had no idea we'd build something so beautiful together.",
            ]}
          />
          <JourneyBlock
            reverse
            src={STORY_PHOTOS.recentOuting}
            alt="Our most recent outing"
            title="And We're Still Making Memories"
            lines={[
              "We've changed.",
              "We've grown.",
              "We've laughed.",
              "We've learned.",
              "And I'd still choose you all over again.",
            ]}
          />
        </div>
      </div>
    </section>
  );
}
