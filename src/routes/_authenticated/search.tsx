import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { ComingSoon } from "@/components/keepsake/ComingSoon";
import { PageShell } from "@/components/keepsake/PageShell";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({
    meta: [
      { title: "Search — The Keepsake" },
      { name: "description", content: "One place to find any letter, photo, plan or memory." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Search — The Keepsake" },
      { property: "og:description", content: "One place to find any letter, photo, plan or memory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell eyebrow="Search" title="Search Everything" intro="One place to find any letter, photo, plan or memory.">
      <ComingSoon
        icon={Search}
        note="One place to find any letter, photo, plan or memory."
        bullets={["Search across every page at once"]}
      />
    </PageShell>
  );
}
