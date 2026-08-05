import { createFileRoute } from "@tanstack/react-router";
import { Archive } from "lucide-react";

import { ComingSoon } from "@/components/keepsake/ComingSoon";
import { PageShell } from "@/components/keepsake/PageShell";

export const Route = createFileRoute("/_authenticated/archive")({
  head: () => ({
    meta: [
      { title: "Archive — The Keepsake" },
      { name: "description", content: "Nothing is ever really deleted — everything we tuck away lives here." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Archive — The Keepsake" },
      { property: "og:description", content: "Nothing is ever really deleted — everything we tuck away lives here." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell eyebrow="Archive" title="The Archive" intro="Nothing is ever really deleted — everything we tuck away lives here.">
      <ComingSoon
        icon={Archive}
        note="Nothing is ever really deleted — everything we tuck away lives here."
        bullets={["Restore anything, any time"]}
      />
    </PageShell>
  );
}
