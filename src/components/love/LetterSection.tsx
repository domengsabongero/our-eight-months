import { useState } from "react";
import { FadeUp } from "./FadeUp";
import { SectionHeading } from "./SectionHeading";
import { Typewriter } from "./Typewriter";

const BODY: string[] = [
  "Eight months may not sound like a lifetime, but somehow, you've filled them with enough love, laughter, and memories to last forever in my heart.",
  "Thank you for being my safe place, my favorite person, and the one who makes even the most ordinary days feel special. Whether we're out on a date, laughing over something completely random, sharing coffee, or simply sitting together in silence, every moment with you becomes a memory I never want to lose.",
  "You've seen me at my best and at my worst, yet you continue to choose me. That is something I'll never take for granted.",
  "If I could relive these past eight months, I'd do it all over again — the smiles, the adventures, the little arguments that made us stronger, the late-night conversations, the hugs, and every \u201CI miss you\u201D that reminded me how much you mean to me.",
  "But if there's one thing I wouldn't change, it's finding you.",
  "You inspire me to dream bigger, work harder, and become a better man — not because you ask me to, but because loving you gives me a reason to keep growing.",
  "As we celebrate another month together, I don't just hope for more memories. I hope for more mornings, more coffee dates, more random adventures, more laughter until our stomachs hurt, more comfort during difficult days, and countless moments where I get to look at you and quietly think,",
];

const CLOSING: string[] = [
  "No matter what tomorrow brings, I want you to remember this:",
];

export function LetterSection() {
  const [typed, setTyped] = useState(false);

  return (
    <section className="relative bg-cream-glow px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="My Letter To You" title="A few words from my heart" />

        <FadeUp className="mt-14 sm:mt-16">
          <article className="glass-card relative rounded-[2rem] px-7 py-12 sm:px-14 sm:py-16">
            <span
              aria-hidden
              className="pointer-events-none absolute left-6 top-4 font-serif text-7xl leading-none text-rosegold/25"
            >
              &ldquo;
            </span>

            <p className="font-serif text-2xl font-medium text-ink sm:text-3xl">
              <Typewriter
                text="My Dearest Maxine,"
                speed={70}
                onDone={() => setTyped(true)}
              />
            </p>

            <p className="mt-6 font-serif text-lg italic text-rosegold sm:text-xl">
              Happy 8th Monthsary, my love. ❤️
            </p>

            <div
              className="mt-8 space-y-6 transition-opacity duration-1000"
              style={{ opacity: typed ? 1 : 0 }}
            >
              {BODY.map((p, i) => (
                <FadeUp key={i} delay={i * 0.05} as="p">
                  <span className="block text-pretty text-base leading-relaxed text-ink/90 sm:text-lg">
                    {p}
                  </span>
                </FadeUp>
              ))}

              <FadeUp>
                <p className="text-center font-serif text-2xl italic text-rosegold sm:text-3xl">
                  &ldquo;How did I get so lucky?&rdquo;
                </p>
              </FadeUp>

              {CLOSING.map((p, i) => (
                <FadeUp key={i} as="p">
                  <span className="block text-pretty text-base leading-relaxed text-ink/90 sm:text-lg">
                    {p}
                  </span>
                </FadeUp>
              ))}

              <FadeUp className="space-y-1 text-center font-serif text-xl text-ink sm:text-2xl">
                <p>You are deeply loved.</p>
                <p>You are appreciated.</p>
                <p>You are cherished.</p>
              </FadeUp>

              <FadeUp as="p">
                <span className="block text-pretty text-base leading-relaxed text-ink/90 sm:text-lg">
                  And if I had the chance to choose all over again, in every lifetime, in
                  every universe, through every beginning and every ending&hellip;
                </span>
              </FadeUp>

              <FadeUp>
                <p className="text-gradient-rose text-center font-serif text-3xl font-medium sm:text-4xl">
                  I would still choose you.
                </p>
              </FadeUp>

              <FadeUp className="pt-4 text-right">
                <p className="font-serif text-xl text-ink sm:text-2xl">
                  Happy 8th Monthsary, my forever favorite.
                </p>
                <p className="mt-2 font-serif italic text-rosegold">
                  I love you endlessly.
                </p>
                <p className="mt-4 font-serif text-2xl font-medium text-ink">
                  — Bruce ❤️
                </p>
              </FadeUp>
            </div>
          </article>
        </FadeUp>
      </div>
    </section>
  );
}
