import { useMemo } from "react";

type Dot = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
};

/**
 * Soft glowing particles that gently twinkle in place.
 * Decorative background layer.
 */
export function Particles({ count = 30 }: { count?: number }) {
  const dots = useMemo<Dot[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 5,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 6,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-rosegold-soft"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            filter: "blur(0.5px)",
            boxShadow: "0 0 8px 2px color-mix(in oklab, var(--rosegold) 45%, transparent)",
            animation: `twinkle ${d.duration}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
