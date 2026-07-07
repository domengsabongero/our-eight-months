import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const COVER = "/images/1_CoverPhoto.png";

export function Hero({ onBegin }: { onBegin: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.85]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 text-center"
    >
      <motion.img
        src={COVER}
        alt="Bruce and Maxine together at golden hour"
        fetchPriority="high"
        style={{ y, scale }}
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70"
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.3 }}
          className="text-sm font-light uppercase tracking-[0.5em] text-white/85"
        >
          Happy 8th Monthsary ❤
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.3, delay: 0.55 }}
          className="mt-5 font-serif text-6xl font-medium leading-none text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] sm:text-7xl md:text-8xl"
        >
          Maxine
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          className="mx-auto mt-7 max-w-md text-pretty text-base font-light leading-relaxed text-white/90 sm:text-lg"
        >
          Eight months with you have been some of the happiest moments of my life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.25 }}
          className="mt-10"
        >
          <button
            onClick={onBegin}
            className="btn-glow btn-glow-hover rounded-full px-9 py-4 text-sm font-medium uppercase tracking-[0.2em]"
          >
            Begin Our Story
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/60 p-1.5"
        >
          <span className="h-2 w-1 rounded-full bg-white/80" />
        </motion.div>
      </motion.div>
    </section>
  );
}
