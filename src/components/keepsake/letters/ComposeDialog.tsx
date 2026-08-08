import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, Send, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { RichText } from "@/components/keepsake/letters/RichText";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getKeepsake } from "@/lib/keepsake.functions";
import {
  addLetterAttachments,
  deleteDraft,
  deleteLetterAttachment,
  getLetter,
  LETTERS_BUCKET,
  saveDraft,
  sendLetter,
} from "@/lib/letters.functions";

function extOf(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}

export function ComposeDialog({
  open,
  draftId,
  onOpenChange,
}: {
  open: boolean;
  draftId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const save = useServerFn(saveDraft);
  const send = useServerFn(sendLetter);
  const remove = useServerFn(deleteDraft);
  const fetchLetter = useServerFn(getLetter);
  const fetchKeepsake = useServerFn(getKeepsake);
  const recordFiles = useServerFn(addLetterAttachments);
  const removeFile = useServerFn(deleteLetterAttachment);

  const [id, setId] = useState<string | null>(draftId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const loadedFor = useRef<string | null>(null);

  const { data: keepsake } = useQuery({
    queryKey: ["keepsake"],
    queryFn: () => fetchKeepsake(),
  });

  const { data: existing } = useQuery({
    queryKey: ["letters", "detail", draftId],
    queryFn: () => fetchLetter({ data: { id: draftId! } }),
    enabled: open && !!draftId,
  });

  const { data: current } = useQuery({
    queryKey: ["letters", "detail", id],
    queryFn: () => fetchLetter({ data: { id: id! } }),
    enabled: open && !!id,
  });

  useEffect(() => {
    if (!open) {
      loadedFor.current = null;
      return;
    }
    if (draftId && existing && loadedFor.current !== draftId) {
      loadedFor.current = draftId;
      setId(existing.id);
      setTitle(existing.title === "Untitled letter" ? "" : existing.title);
      setBody(existing.body);
      setScheduledFor(
        existing.scheduled_for
          ? new Date(existing.scheduled_for).toISOString().slice(0, 16)
          : "",
      );
    }
    if (!draftId && loadedFor.current !== "new") {
      loadedFor.current = "new";
      setId(null);
      setTitle("");
      setBody("");
      setScheduledFor("");
      setSavedAt(null);
    }
  }, [open, draftId, existing]);

  const persist = useMutation({
    mutationFn: async (silent: boolean) => {
      const result = await save({
        data: { id: id ?? undefined, title, body, scheduledFor: scheduledFor || null },
      });
      return { result, silent };
    },
    onSuccess: ({ result, silent }) => {
      setId(result.id);
      setSavedAt(new Date().toLocaleTimeString(undefined, { timeStyle: "short" }));
      queryClient.invalidateQueries({ queryKey: ["letters"] });
      if (!silent) toast.success("Draft saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Autosave a moment after typing stops.
  useEffect(() => {
    if (!open) return;
    if (!title.trim() && !body.replace(/<[^>]*>/g, "").trim()) return;
    const timer = setTimeout(() => persist.mutate(true), 1800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, scheduledFor, open]);

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      let letterId = id;
      if (!letterId) {
        const created = await save({
          data: { id: undefined, title, body, scheduledFor: scheduledFor || null },
        });
        letterId = created.id;
        setId(created.id);
      }
      const items: { storagePath: string; caption: null }[] = [];
      for (const file of files) {
        const path = `${letterId}/${crypto.randomUUID()}.${extOf(file.name)}`;
        const { error } = await supabase.storage
          .from(LETTERS_BUCKET)
          .upload(path, file, { contentType: file.type || "image/jpeg" });
        if (error) throw new Error(error.message);
        items.push({ storagePath: path, caption: null });
      }
      return recordFiles({ data: { letterId: letterId!, items } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
      toast.success("Attached");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const dispatch = useMutation({
    mutationFn: async () => {
      const saved = await save({
        data: { id: id ?? undefined, title, body, scheduledFor: scheduledFor || null },
      });
      return send({ data: { id: saved.id, scheduledFor: scheduledFor || null } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
      toast.success(scheduledFor ? "Letter scheduled" : "Letter sent");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const discard = useMutation({
    mutationFn: () => remove({ data: { id: id! } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
      toast.success("Draft deleted");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const dropFile = useMutation({
    mutationFn: (fileId: string) => removeFile({ data: { id: fileId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["letters"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const partnerName = keepsake?.partner?.display_name ?? "your partner";
  const busy = dispatch.isPending || upload.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="glass-card max-h-[94dvh] max-w-2xl overflow-y-auto rounded-[1.75rem] border-none px-5 py-7 sm:px-9 sm:py-9">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-rosegold">
          Write a letter
        </p>
        <DialogTitle className="text-gradient-rose mt-3 font-serif text-3xl font-medium">
          To {partnerName}
        </DialogTitle>

        <div className="mt-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="letter-title">Title</Label>
            <Input
              id="letter-title"
              value={title}
              maxLength={160}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Something I've been meaning to say"
              className="rounded-2xl bg-white/60"
            />
          </div>

          <RichText value={body} onChange={setBody} placeholder="Dear you…" />

          <div className="space-y-2">
            <Label htmlFor="letter-schedule">Deliver later (optional)</Label>
            <Input
              id="letter-schedule"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="rounded-2xl bg-white/60"
            />
            <p className="text-xs text-muted-foreground">
              Until this moment passes, {partnerName} cannot open it.
            </p>
          </div>

          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) upload.mutate(files);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
              className="rounded-full text-ink/80 hover:text-rosegold"
            >
              {upload.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" />
              )}
              Attach photos
            </Button>

            {!!current?.attachments.length && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {current.attachments.map((file) => (
                  <div key={file.id} className="relative">
                    {file.url && (
                      <img
                        src={file.url}
                        alt={file.caption ?? "Attachment"}
                        className="aspect-square w-full rounded-xl object-cover"
                      />
                    )}
                    <button
                      type="button"
                      aria-label="Remove attachment"
                      onClick={() => dropFile.mutate(file.id)}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-white/90 p-1 text-ink shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-rosegold/20 pt-6">
            <Button
              onClick={() => dispatch.mutate()}
              disabled={busy}
              className="rounded-full bg-rosegold text-cream hover:bg-rosegold/90"
            >
              {dispatch.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {scheduledFor ? "Schedule" : "Send letter"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => persist.mutate(false)}
              disabled={persist.isPending || busy}
              className="rounded-full text-ink/80 hover:text-rosegold"
            >
              Save draft
            </Button>

            {id && (
              <Button
                variant="ghost"
                onClick={() => discard.mutate()}
                disabled={discard.isPending || busy}
                className="rounded-full text-ink/60 hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}

            {savedAt && (
              <span className="ml-auto text-xs text-muted-foreground">
                Saved {savedAt}
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
