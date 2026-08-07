import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { addGalleryItems, GALLERY_BUCKET } from "@/lib/gallery.functions";

function extOf(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const record = useServerFn(addGalleryItems);

  const upload = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Please sign in again.");

      const uploaded: { storagePath: string; caption: string | null; takenAt: string | null }[] =
        [];

      for (const file of files) {
        const path = `${userId}/${crypto.randomUUID()}.${extOf(file.name)}`;
        const { error } = await supabase.storage
          .from(GALLERY_BUCKET)
          .upload(path, file, { contentType: file.type || "image/jpeg" });
        if (error) throw new Error(error.message);
        uploaded.push({
          storagePath: path,
          caption: files.length === 1 ? caption || null : caption || null,
          takenAt: takenAt || null,
        });
      }

      return record({ data: { items: uploaded } });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success(
        result.count > 1 ? `${result.count} memories added` : "Memory added to our gallery",
      );
      setFiles([]);
      setCaption("");
      setTakenAt("");
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full bg-rosegold px-6 text-cream hover:bg-rosegold/90"
      >
        <ImagePlus className="mr-2 h-4 w-4" />
        Add photos
      </Button>

      <Dialog open={open} onOpenChange={(v) => !upload.isPending && setOpen(v)}>
        <DialogContent className="glass-card max-w-md rounded-[1.75rem] border-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium text-ink">
              Add to our gallery
            </DialogTitle>
            <DialogDescription>
              Only the two of us will ever see these.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full rounded-[1.25rem] border border-dashed border-rosegold/50 bg-white/50 px-5 py-8 text-center transition-colors hover:bg-white/70"
              >
                <ImagePlus className="mx-auto h-6 w-6 text-rosegold" />
                <span className="mt-3 block text-sm text-ink/80">
                  {files.length
                    ? `${files.length} photo${files.length > 1 ? "s" : ""} selected`
                    : "Choose photos"}
                </span>
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What was happening here?"
                rows={2}
                className="rounded-2xl bg-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="takenAt">Date taken</Label>
              <Input
                id="takenAt"
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="rounded-2xl bg-white/60"
              />
            </div>

            <Button
              onClick={() => upload.mutate()}
              disabled={!files.length || upload.isPending}
              className="w-full rounded-full bg-rosegold text-cream hover:bg-rosegold/90"
            >
              {upload.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {upload.isPending ? "Saving…" : "Save to gallery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
