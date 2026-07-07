import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";

const REASONS = [
  { icon: "😊", text: "Your beautiful smile" },
  { icon: "🤍", text: "Your kindness" },
  { icon: "💪", text: "Your strength" },
  { icon: "🕊️", text: "Your patience" },
  { icon: "😄", text: "Your laugh" },
  { icon: "🌷", text: "The way you care" },
  { icon: "✨", text: "The way you make ordinary days feel special" },
  { icon: "❤️", text: "Simply because you're you." },
];

export function ReasonsSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Reasons I Love You"
          title="A few of the countless reasons"
        />

        <div className="mt-16 grid gap-5 sm:mt-20 sm:grid-cols-2">
          {REASONS.map((r, i) => (
            <motion.div
              key={r.text}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: (i % 2) * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-card flex items-center gap-4 rounded-3xl p-6 sm:p-7"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blush/60 text-2xl">
                {r.icon}
              </span>
              <p className="text-pretty font-serif text-lg leading-snug text-ink sm:text-xl">
                {r.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
