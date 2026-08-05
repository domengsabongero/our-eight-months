import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { ComingSoon } from "@/components/keepsake/ComingSoon";
import { PageShell } from "@/components/keepsake/PageShell";

export const Route = createFileRoute("/_authenticated/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — The Keepsake" },
      { name: "description", content: "Every first, every trip, every small milestone laid out in order." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Timeline — The Keepsake" },
      { property: "og:description", content: "Every first, every trip, every small milestone laid out in order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell eyebrow="Timeline" title="Our Timeline" intro="Every first, every trip, every small milestone laid out in order.">
      <ComingSoon
        icon={Sparkles}
        note="Every first, every trip, every small milestone laid out in order."
        bullets={["Add moments with dates and photos", "Scroll through us, month by month"]}
      />
    </PageShell>
  );
}
