import type { LucideIcon } from "lucide-react";

import { FadeUp } from "@/components/love/FadeUp";

export function ComingSoon({
  icon: Icon,
  note,
  bullets = [],
}: {
  icon: LucideIcon;
  note: string;
  bullets?: string[];
}) {
  return (
    <FadeUp>
      <div className="glass-card rounded-[2rem] px-7 py-12 text-center sm:px-12 sm:py-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/70">
          <Icon className="h-6 w-6 text-rosegold" />
        </div>
        <p className="mx-auto mt-6 max-w-md text-pretty text-base leading-relaxed text-ink/85">
          {note}
        </p>

        {bullets.length > 0 && (
          <ul className="mx-auto mt-8 max-w-sm space-y-2 text-left text-sm text-muted-foreground">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 text-xs text-rosegold">❤</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-[0.65rem] uppercase tracking-[0.35em] text-rosegold/80">
          Coming soon
        </p>
      </div>
    </FadeUp>
  );
}
