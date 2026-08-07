import { motion } from "framer-motion";
import { FadeUp } from "./FadeUp";
import { ParallaxPhoto } from "./ParallaxPhoto";
import { SectionHeading } from "./SectionHeading";
import { STORY_PHOTOS } from "@/lib/story-photos";

const EMOJIS = ["😂", "😜", "🤪", "😆", "🥲", "😍", "🤭", "✨"];

function PlayfulCard({
  src,
  alt,
  caption,
  emoji,
  delay = 0,
}: {
  src: string;
  alt: string;
  caption: string;
  emoji: string;
  delay?: number;
}) {
  return (
    <FadeUp delay={delay}>
      <motion.div
        whileHover={{ rotate: [0, -1.5, 1.5, 0], scale: 1.02 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <motion.span
          aria-hidden
          animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-2 -top-4 z-10 text-4xl drop-shadow-md sm:-right-4"
        >
          {emoji}
        </motion.span>
        <ParallaxPhoto src={src} alt={alt} className="aspect-[4/5] w-full" />
        <p className="mt-5 text-pretty text-center font-serif text-xl leading-relaxed text-ink sm:text-2xl">
          {caption}
        </p>
      </motion.div>
    </FadeUp>
  );
}

export function FunnySection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      {/* Playful floating emojis */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {EMOJIS.map((e, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl opacity-40 sm:text-3xl"
            style={{ left: `${(i * 12 + 5) % 95}%`, top: `${(i * 17 + 10) % 85}%` }}
            animate={{ y: [0, -18, 0], rotate: [0, 12, -12, 0] }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            {e}
          </motion.span>
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="The Funniest Memories"
          title="Laughing until it hurts"
        />

        <div className="mt-20 grid gap-14 sm:mt-24 sm:grid-cols-2 sm:gap-10">
          <PlayfulCard
            src={STORY_PHOTOS.pole}
            alt="A funny candid of Maxine"
            caption="You'll probably laugh when you see this again."
            emoji="😂"
          />
          <PlayfulCard
            src={STORY_PHOTOS.goggles}
            alt="Bruce being goofy with goggles"
            caption="Thank you for loving every version of me… even this one."
            emoji="🤪"
            delay={0.15}
          />
        </div>
      </div>
    </section>
  );
}
