import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { ComingSoon } from "@/components/keepsake/ComingSoon";
import { PageShell } from "@/components/keepsake/PageShell";

export const Route = createFileRoute("/_authenticated/capsules")({
  head: () => ({
    meta: [
      { title: "Time Capsules — The Keepsake" },
      { name: "description", content: "Letters and photos sealed today, opened on a future date." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Time Capsules — The Keepsake" },
      { property: "og:description", content: "Letters and photos sealed today, opened on a future date." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell eyebrow="Time Capsules" title="Time Capsules" intro="Letters and photos sealed today, opened on a future date.">
      <ComingSoon
        icon={Clock}
        note="Letters and photos sealed today, opened on a future date."
        bullets={["Write to our future selves", "Locked until the day you choose"]}
      />
    </PageShell>
  );
}
