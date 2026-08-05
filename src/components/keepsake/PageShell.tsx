import type { ReactNode } from "react";

import { FadeUp } from "@/components/love/FadeUp";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-28 pt-10 sm:px-8 sm:pb-16 sm:pt-16">
      <FadeUp>
        {eyebrow && (
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.4em] text-rosegold">
            {eyebrow}
          </p>
        )}
        <h1 className="text-gradient-rose mt-3 text-balance font-serif text-4xl font-medium leading-tight sm:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            {intro}
          </p>
        )}
      </FadeUp>

      <div className="mt-10 sm:mt-12">{children}</div>
    </div>
  );
}
