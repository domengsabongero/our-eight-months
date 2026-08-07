import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Archive as ArchiveIcon, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FadeUp } from "@/components/love/FadeUp";
import { Lightbox, PhotoTile } from "@/components/keepsake/gallery/GalleryViews";
import { PageShell } from "@/components/keepsake/PageShell";
import { Button } from "@/components/ui/button";
import { listGallery, updateGalleryItem } from "@/lib/gallery.functions";

export const Route = createFileRoute("/_authenticated/archive")({
  head: () => ({
    meta: [
      { title: "Archive — The Keepsake" },
      { name: "description", content: "Nothing is ever really deleted — everything we tuck away lives here." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Archive — The Keepsake" },
      { property: "og:description", content: "Nothing is ever really deleted — everything we tuck away lives here." },
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["gallery", "archived"],
    queryFn: () => fetchGallery({ data: { archived: true } }),
  });

  const restore = useMutation({
    mutationFn: (id: string) => update({ data: { id, isArchived: false } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Back in the gallery");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const photos = data ?? [];

  return (
    <PageShell
      eyebrow="Archive"
      title="The Archive"
      intro="Nothing is ever really deleted — everything we tuck away lives here."
    >
      {isLoading ? (
        <div className="columns-2 gap-4 sm:columns-3">
          {[0, 1, 2].map((i) => (
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
              <ArchiveIcon className="h-6 w-6 text-rosegold" />
            </div>
            <p className="mx-auto mt-6 max-w-md text-pretty font-serif text-xl text-ink">
              The archive is empty — nothing has been tucked away yet.
            </p>
          </div>
        </FadeUp>
      ) : (
        <div className="columns-2 gap-4 sm:columns-3">
          {photos.map((photo, i) => (
            <div key={photo.id} className="mb-4 break-inside-avoid">
              <PhotoTile photo={photo} index={i} onOpen={() => setOpenIndex(i)} />
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 rounded-full text-rosegold"
                onClick={() => restore.mutate(photo.id)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </Button>
            </div>
          ))}
        </div>
      )}

      <Lightbox
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </PageShell>
  );
}
