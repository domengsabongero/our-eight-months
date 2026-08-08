import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PenLine } from "lucide-react";
import { useState } from "react";

import { ComposeDialog } from "@/components/keepsake/letters/ComposeDialog";
import { LetterList } from "@/components/keepsake/letters/LetterList";
import { LetterReader } from "@/components/keepsake/letters/LetterReader";
import { PageShell } from "@/components/keepsake/PageShell";
import { Button } from "@/components/ui/button";
import { listLetters, type LetterBox } from "@/lib/letters.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/letters")({
  head: () => ({
    meta: [
      { title: "Letters — The Keepsake" },
      {
        name: "description",
        content: "Every letter we write to each other, kept somewhere safe forever.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Letters — The Keepsake" },
      {
        property: "og:description",
        content: "Every letter we write to each other, kept somewhere safe forever.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const BOXES: { key: LetterBox; label: string }[] = [
  { key: "inbox", label: "Inbox" },
  { key: "sent", label: "Sent" },
  { key: "drafts", label: "Drafts" },
  { key: "scheduled", label: "Scheduled" },
  { key: "favorites", label: "Favourites" },
  { key: "archived", label: "Archived" },
];

function Page() {
  const fetchLetters = useServerFn(listLetters);
  const [box, setBox] = useState<LetterBox>("inbox");
  const [reading, setReading] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["letters", box],
    queryFn: () => fetchLetters({ data: { box } }),
  });

  const openCompose = (id: string | null) => {
    setDraftId(id);
    setComposeOpen(true);
  };

  return (
    <PageShell
      eyebrow="Letters"
      title="Our Letters"
      intro="Every letter we write to each other, kept somewhere safe forever."
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {BOXES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setBox(item.key)}
              className={cn(
                "rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors",
                box === item.key
                  ? "bg-rosegold text-cream"
                  : "bg-white/55 text-ink/70 hover:bg-white/80",
              )}
            >
              {item.label}
            </button>
          ))}

          <Button
            onClick={() => openCompose(null)}
            className="ml-auto rounded-full bg-rosegold px-6 text-cream hover:bg-rosegold/90"
          >
            <PenLine className="mr-2 h-4 w-4" />
            Write a letter
          </Button>
        </div>

        <LetterList
          letters={data ?? []}
          box={box}
          isLoading={isLoading}
          onOpen={(letter) =>
            letter.status === "draft" && letter.is_mine
              ? openCompose(letter.id)
              : setReading(letter.id)
          }
        />
      </div>

      <LetterReader
        letterId={reading}
        onClose={() => setReading(null)}
        onEditDraft={(id) => {
          setReading(null);
          openCompose(id);
        }}
      />

      <ComposeDialog
        open={composeOpen}
        draftId={draftId}
        onOpenChange={(open) => {
          setComposeOpen(open);
          if (!open) setDraftId(null);
        }}
      />
    </PageShell>
  );
}
