import { createFileRoute } from "@tanstack/react-router";
import { CalendarHeart } from "lucide-react";

import { ComingSoon } from "@/components/keepsake/ComingSoon";
import { PageShell } from "@/components/keepsake/PageShell";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — The Keepsake" },
      { name: "description", content: "Monthsaries, birthdays, and the dates we never want to miss." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Calendar — The Keepsake" },
      { property: "og:description", content: "Monthsaries, birthdays, and the dates we never want to miss." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell eyebrow="Calendar" title="Our Calendar" intro="Monthsaries, birthdays, and the dates we never want to miss.">
      <ComingSoon
        icon={CalendarHeart}
        note="Monthsaries, birthdays, and the dates we never want to miss."
        bullets={["Yearly reminders for the days that matter", "Plan our next date night"]}
      />
    </PageShell>
  );
}
