import { createFileRoute } from "@tanstack/react-router";
import { PawPrint } from "lucide-react";

import { ComingSoon } from "@/components/keepsake/ComingSoon";
import { PageShell } from "@/components/keepsake/PageShell";

export const Route = createFileRoute("/_authenticated/pets")({
  head: () => ({
    meta: [
      { title: "Pets — The Keepsake" },
      { name: "description", content: "A page for the small creatures that make our world softer." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Pets — The Keepsake" },
      { property: "og:description", content: "A page for the small creatures that make our world softer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell eyebrow="Pets" title="Our Little Ones" intro="A page for the small creatures that make our world softer.">
      <ComingSoon
        icon={PawPrint}
        note="A page for the small creatures that make our world softer."
        bullets={["Names, birthdays and photos", "Little notes about their personalities"]}
      />
    </PageShell>
  );
}
