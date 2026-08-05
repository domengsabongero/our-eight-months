import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { ComingSoon } from "@/components/keepsake/ComingSoon";
import { PageShell } from "@/components/keepsake/PageShell";

export const Route = createFileRoute("/_authenticated/letters")({
  head: () => ({
    meta: [
      { title: "Letters — The Keepsake" },
      { name: "description", content: "Every letter we write to each other, kept somewhere safe forever." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Letters — The Keepsake" },
      { property: "og:description", content: "Every letter we write to each other, kept somewhere safe forever." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell eyebrow="Letters" title="Our Letters" intro="Every letter we write to each other, kept somewhere safe forever.">
      <ComingSoon
        icon={Mail}
        note="Every letter we write to each other, kept somewhere safe forever."
        bullets={["Write letters with the same handwritten feel as our story", "Mood tags and quiet drafts", "Read them together on hard days"]}
      />
    </PageShell>
  );
}
