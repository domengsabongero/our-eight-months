import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { useEffect } from "react";

import type { GalleryPhoto } from "@/lib/gallery.functions";
import { cn } from "@/lib/utils";

function prettyDate(photo: GalleryPhoto) {
  const raw = photo.taken_at ?? photo.created_at;
  const d = new Date(photo.taken_at ? `${photo.taken_at}T00:00:00` : photo.created_at);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export function PhotoTile({
  photo,
  index,
  onOpen,
  onToggleFavorite,
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: () => void;
  onToggleFavorite?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative mb-4 break-inside-avoid"
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full overflow-hidden rounded-[1.5rem] shadow-soft transition-transform duration-500 hover:-translate-y-1"
      >
        {photo.url ? (
          <img
            src={photo.url}
            alt={photo.caption ?? "A photo of us"}
            loading="lazy"
            className="w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="aspect-[3/4] w-full bg-white/60" />
        )}
      </button>

      {onToggleFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={photo.is_favorite ? "Remove from favourites" : "Add to favourites"}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 backdrop-blur transition-colors hover:bg-white"
        >
          <Heart
            className={cn(
              "h-4 w-4 text-rosegold transition-transform duration-300",
              photo.is_favorite && "scale-110 fill-current",
            )}
          />
        </button>
      )}

      {photo.caption && (
        <p className="mt-2 px-1 text-sm leading-relaxed text-muted-foreground">
          {photo.caption}
        </p>
      )}
    </motion.div>
  );
}

export function PhotoGrid({
  photos,
  onOpen,
  onToggleFavorite,
}: {
  photos: GalleryPhoto[];
  onOpen: (index: number) => void;
  onToggleFavorite?: (photo: GalleryPhoto) => void;
}) {
  return (
    <div className="columns-2 gap-4 sm:columns-3">
      {photos.map((photo, i) => (
        <PhotoTile
          key={photo.id}
          photo={photo}
          index={i}
          onOpen={() => onOpen(i)}
          {...(onToggleFavorite ? { onToggleFavorite: () => onToggleFavorite(photo) } : {})}
        />
      ))}
    </div>
  );
}

export function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: GalleryPhoto[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const open = index !== null && photos[index] !== undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange(((index as number) + 1) % photos.length);
      if (e.key === "ArrowLeft")
        onIndexChange(((index as number) - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, photos.length, onClose, onIndexChange]);

  const photo = open ? photos[index as number]! : null;

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-cream transition-colors hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  onIndexChange(((index as number) - 1 + photos.length) % photos.length);
                }}
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-cream transition-colors hover:bg-white/25 sm:left-8"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  onIndexChange(((index as number) + 1) % photos.length);
                }}
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-cream transition-colors hover:bg-white/25 sm:right-8"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <motion.figure
            key={photo.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-full w-full max-w-3xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {photo.url && (
              <img
                src={photo.url}
                alt={photo.caption ?? "A photo of us"}
                className="mx-auto max-h-[70vh] w-auto rounded-[1.5rem] object-contain shadow-soft"
              />
            )}
            <figcaption className="mt-5 space-y-1 px-4">
              {photo.caption && (
                <p className="font-serif text-lg text-cream">{photo.caption}</p>
              )}
              <p className="text-[0.7rem] uppercase tracking-[0.3em] text-cream/60">
                {prettyDate(photo)}
                {photo.author_name ? ` · added by ${photo.author_name}` : ""}
              </p>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
