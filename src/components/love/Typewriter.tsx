import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Types out a string character-by-character once it scrolls into view,
 * with a blinking caret. Respects reduced-motion by rendering instantly.
 */
export function Typewriter({
  text,
  speed = 45,
  className = "",
  onDone,
}: {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [count, setCount] = useState(0);
  const done = count >= text.length;

  useEffect(() => {
    if (!inView) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setCount(text.length);
      onDone?.();
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, text, speed]);

  return (
    <span ref={ref} className={className}>
      {text.slice(0, count)}
      {!done && (
        <motion.span
          aria-hidden
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          className="ml-0.5 inline-block w-[2px] translate-y-1 self-baseline bg-rosegold align-middle"
          style={{ height: "0.9em" }}
        />
      )}
    </span>
  );
}
