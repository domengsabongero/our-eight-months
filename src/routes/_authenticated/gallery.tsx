import { createFileRoute } from "@tanstack/react-router";
import { Images } from "lucide-react";

import { ComingSoon } from "@/components/keepsake/ComingSoon";
import { PageShell } from "@/components/keepsake/PageShell";

export const Route = createFileRoute("/_authenticated/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — The Keepsake" },
      { name: "description", content: "A private album for every photo of us — the posed ones and the blurry ones." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Gallery — The Keepsake" },
      { property: "og:description", content: "A private album for every photo of us — the posed ones and the blurry ones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell eyebrow="Gallery" title="Our Gallery" intro="A private album for every photo of us — the posed ones and the blurry ones.">
      <ComingSoon
        icon={Images}
        note="A private album for every photo of us — the posed ones and the blurry ones."
        bullets={["Upload photos privately", "Favourites and captions", "Grouped by the day they happened"]}
      />
    </PageShell>
  );
}
