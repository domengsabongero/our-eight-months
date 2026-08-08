import { Clock, Heart, Mail, Paperclip } from "lucide-react";

import { FadeUp } from "@/components/love/FadeUp";
import type { LetterBox, LetterCardData } from "@/lib/letters.functions";
import { cn } from "@/lib/utils";

const EMPTY_COPY: Record<LetterBox, string> = {
  inbox: "No letters yet. The first one is waiting to be written.",
  sent: "Your sent letters will live here.",
  drafts: "Unfinished thoughts belong here until you're ready.",
  scheduled: "Letters waiting for their moment will rest here.",
  favorites: "Letters you want to keep close will appear here.",
  archived: "Nothing put away yet.",
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LetterCard({
  letter,
  box,
  onOpen,
}: {
  letter: LetterCardData;
  box: LetterBox;
  onOpen: () => void;
}) {
  const person =
    box === "inbox"
      ? (letter.author_name ?? "Someone")
      : letter.is_mine
        ? (letter.recipient_name ?? "your partner")
        : (letter.author_name ?? "Someone");
  const personLabel = box === "inbox" || !letter.is_mine ? "From" : "To";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "glass-card group w-full rounded-[1.5rem] px-5 py-5 text-left transition-transform duration-500 hover:-translate-y-1 sm:px-6",
        letter.is_unread && "ring-1 ring-rosegold/45",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-rosegold">
          {personLabel} {person}
        </p>
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          {letter.attachment_count > 0 && <Paperclip className="h-3.5 w-3.5" />}
          {letter.is_favorite && (
            <Heart className="h-3.5 w-3.5 fill-rosegold text-rosegold" />
          )}
          {letter.is_unread && (
            <span className="h-2 w-2 rounded-full bg-rosegold" aria-label="Unread" />
          )}
        </div>
      </div>

      <h3 className="mt-2 font-serif text-xl font-medium text-ink">{letter.title}</h3>
      {letter.preview && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {letter.preview}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] text-muted-foreground">
        <span>{formatDate(letter.sent_at ?? letter.updated_at)}</span>
        {letter.status === "draft" && (
          <span className="text-rosegold/90">Draft</span>
        )}
        {letter.is_pending && (
          <span className="inline-flex items-center gap-1 text-rosegold/90">
            <Clock className="h-3 w-3" />
            Arrives {formatDateTime(letter.scheduled_for)}
          </span>
        )}
        {letter.is_mine && letter.status === "sent" && !letter.is_pending && (
          <span>{letter.read_at ? `Opened ${formatDate(letter.read_at)}` : "Not opened yet"}</span>
        )}
      </div>
    </button>
  );
}

export function LetterList({
  letters,
  box,
  isLoading,
  onOpen,
}: {
  letters: LetterCardData[];
  box: LetterBox;
  isLoading?: boolean;
  onOpen: (letter: LetterCardData) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass-card h-40 animate-pulse rounded-[1.5rem] opacity-60"
          />
        ))}
      </div>
    );
  }

  if (!letters.length) {
    return (
      <FadeUp>
        <div className="glass-card rounded-[2rem] px-7 py-14 text-center sm:px-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/70">
            <Mail className="h-6 w-6 text-rosegold" />
          </div>
          <p className="mx-auto mt-6 max-w-sm text-pretty text-base leading-relaxed text-ink/85">
            {EMPTY_COPY[box]}
          </p>
        </div>
      </FadeUp>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {letters.map((letter, i) => (
        <FadeUp key={letter.id} delay={Math.min(i, 6) * 0.05}>
          <LetterCard letter={letter} box={box} onOpen={() => onOpen(letter)} />
        </FadeUp>
      ))}
    </div>
  );
}
