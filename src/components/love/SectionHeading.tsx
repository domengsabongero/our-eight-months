import { FadeUp } from "./FadeUp";

/**
 * Centered section heading with a small eyebrow and a delicate divider.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <FadeUp className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-rosegold">
          {eyebrow}
        </p>
      )}
      <h2 className="text-gradient-rose text-balance text-4xl font-medium leading-tight sm:text-5xl">
        {title}
      </h2>
      <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-rosegold/70">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-rosegold/60" />
        <span className="text-sm">❤</span>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-rosegold/60" />
      </div>
      {subtitle && (
        <p className="mt-6 text-pretty text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </FadeUp>
  );
}
