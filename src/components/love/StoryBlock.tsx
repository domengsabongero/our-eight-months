import { motion } from "framer-motion";
import { FadeUp } from "./FadeUp";
import { ParallaxPhoto } from "./ParallaxPhoto";

/**
 * Alternating photo / message block. On mobile it stacks (photo first);
 * on desktop it alternates left/right based on `reverse`.
 */
export function StoryBlock({
  src,
  alt,
  message,
  eyebrow,
  reverse = false,
}: {
  src: string;
  alt: string;
  message: string;
  eyebrow?: string;
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
        {eyebrow && (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-rosegold">
            {eyebrow}
          </p>
        )}
        <motion.p
          className="text-balance font-serif text-2xl leading-relaxed text-ink sm:text-3xl md:text-[2rem] md:leading-[1.5]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1 }}
        >
          {message}
        </motion.p>
      </FadeUp>
    </div>
  );
}
