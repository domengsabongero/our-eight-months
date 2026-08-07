import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { differenceInCalendarDays } from "date-fns";

import { FadeUp } from "@/components/love/FadeUp";
import { PageShell } from "@/components/keepsake/PageShell";
import { NAV_ITEMS } from "@/components/keepsake/nav-items";
import { getKeepsake } from "@/lib/keepsake.functions";
import { listGallery } from "@/lib/gallery.functions";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Home — The Keepsake" },
      {
        name: "description",
        content: "The private home of our Keepsake — letters, photos and plans in one place.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Home — The Keepsake" },
      {
        property: "og:description",
        content: "A private space for Bruce and Maxine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

const ANNIVERSARY = new Date("2025-11-08T00:00:00");

function HomePage() {
  const fetchKeepsake = useServerFn(getKeepsake);
  const { data } = useQuery({
    queryKey: ["keepsake"],
    queryFn: () => fetchKeepsake(),
  });

  const fetchGallery = useServerFn(listGallery);
  const { data: photos } = useQuery({
    queryKey: ["gallery", "active"],
    queryFn: () => fetchGallery({ data: { archived: false } }),
  });
  const recent = (photos ?? []).slice(0, 4);

  const days = differenceInCalendarDays(new Date(), ANNIVERSARY);
  const name = data?.me?.display_name ?? "my love";
  const shortcuts = NAV_ITEMS.filter((i) =>
    ["/story", "/letters", "/gallery", "/timeline", "/capsules", "/plans"].includes(i.to),
  );

  return (
    <PageShell
      eyebrow="Welcome back"
      title={`Hello, ${name}`}
      intro="Everything we've collected lives here — our story, our letters, our plans, and the memories still to come."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Days together", value: days > 0 ? days : 0 },
          { label: "Months", value: Math.max(0, Math.floor(days / 30.44)) },
          { label: "Keepsake since", value: "08.11.25" },
        ].map((stat, i) => (
          <FadeUp key={stat.label} delay={i * 0.06}>
            <div className="glass-card rounded-[1.75rem] px-6 py-7 text-center">
              <p className="text-gradient-rose font-serif text-4xl font-medium">
                {stat.value}
              </p>
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((item, i) => (
          <FadeUp key={item.to} delay={i * 0.05}>
            <Link
              to={item.to}
              className="glass-card group flex h-full items-center gap-4 rounded-[1.5rem] px-5 py-5 transition-transform duration-500 hover:-translate-y-1"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70">
                <item.icon className="h-5 w-5 text-rosegold" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-lg text-ink">{item.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.to === "/gallery" && photos
                    ? photos.length === 0
                      ? "No photos yet"
                      : `${photos.length} photo${photos.length > 1 ? "s" : ""}`
                    : "Open"}
                </span>
              </span>
              {item.to === "/gallery" && recent.length > 0 && (
                <span className="flex shrink-0 -space-x-2">
                  {recent.map((photo) =>
                    photo.url ? (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt=""
                        className="h-9 w-9 rounded-full border-2 border-white/80 object-cover"
                      />
                    ) : null,
                  )}
                </span>
              )}
            </Link>
          </FadeUp>
        ))}
      </div>
    </PageShell>
  );
}
