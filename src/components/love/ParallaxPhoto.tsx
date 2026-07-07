import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * A rounded, framed photo with a slow Ken Burns zoom and a gentle
 * vertical parallax tied to scroll position.
 */
export function ParallaxPhoto({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-[2rem] shadow-[0_30px_70px_-40px_rgba(120,70,60,0.55)] ring-1 ring-white/60 ${className}`}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        width={1080}
        height={1350}
        style={{ y }}
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 6, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full scale-110 object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>
  );
}
