import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, ArchiveRestore, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getLetter, setLetterState } from "@/lib/letters.functions";
import { cn } from "@/lib/utils";

export function LetterReader({
  letterId,
  onClose,
  onEditDraft,
}: {
  letterId: string | null;
  onClose: () => void;
  onEditDraft?: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const fetchLetter = useServerFn(getLetter);
  const saveState = useServerFn(setLetterState);

  const { data: letter, isLoading } = useQuery({
    queryKey: ["letters", "detail", letterId],
    queryFn: () => fetchLetter({ data: { id: letterId! } }),
    enabled: !!letterId,
  });

  const state = useMutation({
    mutationFn: (input: { isFavorite?: boolean; isArchived?: boolean }) =>
      saveState({ data: { letterId: letterId!, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const date = letter?.sent_at ?? letter?.created_at;

  return (
    <Dialog open={!!letterId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass-card max-h-[92dvh] max-w-2xl overflow-y-auto rounded-[1.75rem] border-none px-6 py-8 sm:px-10 sm:py-10">
        {isLoading || !letter ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-rosegold" />
          </div>
        ) : (
          <>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-rosegold">
              {letter.is_mine
                ? `To ${letter.recipient_name ?? "you"}`
                : `From ${letter.author_name ?? "someone who loves you"}`}
            </p>
            <DialogTitle className="text-gradient-rose mt-3 text-balance font-serif text-3xl font-medium leading-tight sm:text-4xl">
              {letter.title}
            </DialogTitle>
            <p className="mt-2 text-xs text-muted-foreground">
              {date
                ? new Date(date).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
              {letter.status === "draft" && " · Draft"}
              {letter.is_mine && letter.status === "sent" && !letter.is_pending && (
                <> · {letter.read_at ? "Opened" : "Not opened yet"}</>
              )}
              {letter.is_pending && letter.scheduled_for && (
                <>
                  {" "}
                  · Arrives{" "}
                  {new Date(letter.scheduled_for).toLocaleString(undefined, {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </>
              )}
            </p>

            <div
              className="letter-prose mt-7 text-[1.02rem] leading-[1.85] text-ink/90"
              // Server-sanitised on save through an allowlist.
              dangerouslySetInnerHTML={{ __html: letter.body }}
            />

            {letter.attachments.length > 0 && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {letter.attachments.map((file) =>
                  file.url ? (
                    <figure key={file.id} className="overflow-hidden rounded-[1.25rem]">
                      <img
                        src={file.url}
                        alt={file.caption ?? "Letter attachment"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {file.caption && (
                        <figcaption className="px-1 pt-2 text-xs text-muted-foreground">
                          {file.caption}
                        </figcaption>
                      )}
                    </figure>
                  ) : null,
                )}
              </div>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-rosegold/20 pt-6">
              <Button
                variant="ghost"
                onClick={() => state.mutate({ isFavorite: !letter.is_favorite })}
                className="rounded-full text-ink/80 hover:text-rosegold"
              >
                <Heart
                  className={cn(
                    "mr-2 h-4 w-4",
                    letter.is_favorite && "fill-rosegold text-rosegold",
                  )}
                />
                {letter.is_favorite ? "Favourited" : "Favourite"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => state.mutate({ isArchived: !letter.is_archived })}
                className="rounded-full text-ink/80 hover:text-rosegold"
              >
                {letter.is_archived ? (
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                {letter.is_archived ? "Restore" : "Archive"}
              </Button>

              {letter.status === "draft" && letter.is_mine && onEditDraft && (
                <Button
                  onClick={() => onEditDraft(letter.id)}
                  className="ml-auto rounded-full bg-rosegold text-cream hover:bg-rosegold/90"
                >
                  Continue writing
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
