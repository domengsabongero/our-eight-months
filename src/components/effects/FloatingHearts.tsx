import { useMemo } from "react";

type Piece = {
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

/**
 * Softly rising hearts that drift up the whole page behind the content.
 * Purely decorative and pointer-events-none.
 */
export function FloatingHearts({
  count = 14,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 10 + Math.random() * 20,
        duration: 14 + Math.random() * 16,
        delay: Math.random() * 18,
        opacity: 0.25 + Math.random() * 0.4,
      })),
    [count],
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-[-40px] text-rosegold"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            // @ts-expect-error custom prop for keyframes
            "--peak-opacity": p.opacity,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  );
}
