import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { ComingSoon } from "@/components/keepsake/ComingSoon";
import { PageShell } from "@/components/keepsake/PageShell";

export const Route = createFileRoute("/_authenticated/plans")({
  head: () => ({
    meta: [
      { title: "Plans & Finances — The Keepsake" },
      { name: "description", content: "The dreams we're saving for, and the small steps getting us there." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Plans & Finances — The Keepsake" },
      { property: "og:description", content: "The dreams we're saving for, and the small steps getting us there." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell eyebrow="Plans & Finances" title="Plans & Finances" intro="The dreams we're saving for, and the small steps getting us there.">
      <ComingSoon
        icon={Wallet}
        note="The dreams we're saving for, and the small steps getting us there."
        bullets={["Shared goals with target dates", "Simple, private expense tracking"]}
      />
    </PageShell>
  );
}
