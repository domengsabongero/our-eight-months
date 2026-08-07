# Real Photos, Correct Date, and the Gallery

## Part 1 — Photos and anniversary date

**Anniversary date → November 8, 2025**
- The Story finale live counter and the Home dashboard countdown both currently start from Nov 7, 2025; both move to Nov 8, 2025 (the "Keepsake since" tile becomes 08.11.25).
- The shared space record gets `anniversary_date = 2025-11-08` as the single source of truth for future features.

**Your real photos replace every placeholder**

| Section | Photo |
|---|---|
| Hero + Finale background | 1_CoverPhoto |
| Every Moment With You | 2_CuteSelfie, 3_CuteSelfie |
| Our Favorite Dates | 4_FavCoffee_and_Cafe, 5_BestEver_Maki, 6_First_Ever_Meet_With_Sachi |
| The Funniest Memories | 7_MaxineOnPole, 8_BruceCloseUp_With_Goggles |
| Our Journey | 10_FirstEverOuting, 9_MostRecent_Outing |

Photo 6 joins "Our Favorite Dates" as a third block with a short line about the day you two first met Sachi. Old generated placeholders are deleted. No layout, animation, typography, transition, or color changes.

## Part 2 — Gallery (first real feature)

The Gallery page becomes fully working, in the same rose-gold aesthetic.

- **Upload**: pick one or several photos, optional caption and date taken; uploads land in the private `gallery` storage bucket, scoped to your shared space.
- **Grid**: a responsive masonry-style grid with the existing fade-up reveal and soft hover lift. Newest first.
- **Lightbox**: tap a photo for a full-screen view with caption, date, who added it, and left/right navigation.
- **Favorites**: heart a photo; a "Favorites" filter shows only those.
- **Edit / delete**: change a caption or date, remove a photo (removes the stored file too).
- **Archive**: photos can be archived out of the main grid; the Archive page lists archived photos with a restore action.
- **Home dashboard**: the Gallery shortcut gains a live photo count and shows a few recent thumbnails.
- Empty state stays elegant: an invitation to add your first memory rather than a blank grid.

## Technical notes

- Uploaded photos are published to CDN storage as `.asset.json` pointers under `src/assets`; Story components import the pointer and use `.url`.
- Date constants updated in `src/components/love/FinaleSection.tsx` and `src/routes/_authenticated/home.tsx`; a data update sets `public.spaces.anniversary_date`.
- Gallery uses the existing `gallery_items` table and private `gallery` bucket (no schema change needed). Reads/writes go through authenticated server functions in `src/lib/gallery.functions.ts` with `requireSupabaseAuth`; images are shown via short-lived signed URLs. Data fetched with TanStack Query and invalidated after each mutation.
- Uploads go directly from the browser to the private bucket using the signed-in session, then the row is recorded server-side, keeping large files out of server functions.
