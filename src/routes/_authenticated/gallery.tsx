import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Archive as ArchiveIcon, Heart, Images, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FadeUp } from "@/components/love/FadeUp";
import { Lightbox, PhotoGrid } from "@/components/keepsake/gallery/GalleryViews";
import { UploadDialog } from "@/components/keepsake/gallery/UploadDialog";
import { PageShell } from "@/components/keepsake/PageShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteGalleryItem,
  listGallery,
  updateGalleryItem,
  type GalleryPhoto,
} from "@/lib/gallery.functions";
import { cn } from "@/lib/utils";

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
  const queryClient = useQueryClient();
  const fetchGallery = useServerFn(listGallery);
  const update = useServerFn(updateGalleryItem);
  const remove = useServerFn(deleteGalleryItem);

  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState<GalleryPhoto | null>(null);
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["gallery", "active"],
    queryFn: () => fetchGallery({ data: { archived: false } }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["gallery"] });
  };

  const mutateItem = useMutation({
    mutationFn: (input: Parameters<typeof update>[0]["data"]) => update({ data: input }),
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      setOpenIndex(null);
      toast.success("Photo removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const photos = (data ?? []).filter((p) => (favouritesOnly ? p.is_favorite : true));

  return (
    <PageShell
      eyebrow="Gallery"
      title="Our Gallery"
      intro="A private album for every photo of us — the posed ones and the blurry ones."
    >
      <FadeUp>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <UploadDialog />
          <Button
            variant="ghost"
            onClick={() => setFavouritesOnly((v) => !v)}
            className={cn(
              "rounded-full px-5",
              favouritesOnly && "bg-white/70 text-rosegold",
            )}
          >
            <Heart className={cn("mr-2 h-4 w-4", favouritesOnly && "fill-current")} />
            Favourites
          </Button>
          {editing === null && photos.length > 0 && (
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {photos.length} photo{photos.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </FadeUp>

      {isLoading ? (
        <div className="columns-2 gap-4 sm:columns-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="mb-4 aspect-[3/4] w-full animate-pulse break-inside-avoid rounded-[1.5rem] bg-white/50"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <FadeUp>
          <div className="glass-card rounded-[2rem] px-7 py-16 text-center sm:px-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/70">
              <Images className="h-6 w-6 text-rosegold" />
            </div>
            <p className="mx-auto mt-6 max-w-md text-pretty font-serif text-xl text-ink">
              {favouritesOnly
                ? "No favourites yet — heart the photos you love most."
                : "Our album is waiting for its first memory."}
            </p>
            {!favouritesOnly && (
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Add a photo and it will live here forever, just for the two of us.
              </p>
            )}
          </div>
        </FadeUp>
      ) : (
        <>
          <PhotoGrid
            photos={photos}
            onOpen={setOpenIndex}
            onToggleFavorite={(photo) =>
              mutateItem.mutate({ id: photo.id, isFavorite: !photo.is_favorite })
            }
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => {
                  setEditing(photo);
                  setCaption(photo.caption ?? "");
                  setTakenAt(photo.taken_at ?? "");
                }}
                className="hidden"
                aria-hidden
              />
            ))}
          </div>
        </>
      )}

      <Lightbox
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />

      {openIndex !== null && photos[openIndex] && (
        <div className="fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 gap-2 rounded-full bg-white/85 px-3 py-2 shadow-soft backdrop-blur">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => {
              const photo = photos[openIndex]!;
              setEditing(photo);
              setCaption(photo.caption ?? "");
              setTakenAt(photo.taken_at ?? "");
              setOpenIndex(null);
            }}
          >
            <Pencil className="mr-2 h-4 w-4 text-rosegold" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => {
              mutateItem.mutate({ id: photos[openIndex]!.id, isArchived: true });
              setOpenIndex(null);
              toast.success("Moved to the archive");
            }}
          >
            <ArchiveIcon className="mr-2 h-4 w-4 text-rosegold" />
            Archive
          </Button>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="glass-card max-w-md rounded-[1.75rem] border-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium text-ink">
              Edit this memory
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-caption">Caption</Label>
              <Textarea
                id="edit-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="rounded-2xl bg-white/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date taken</Label>
              <Input
                id="edit-date"
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="rounded-2xl bg-white/60"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 rounded-full bg-rosegold text-cream hover:bg-rosegold/90"
                onClick={() => {
                  if (!editing) return;
                  mutateItem.mutate({
                    id: editing.id,
                    caption: caption || null,
                    takenAt: takenAt || null,
                  });
                  setEditing(null);
                  toast.success("Saved");
                }}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                className="rounded-full text-destructive"
                onClick={() => editing && deleteItem.mutate(editing.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
