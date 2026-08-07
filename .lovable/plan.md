# Real Photos + Corrected Anniversary Date

## What changes

1. **Anniversary date → November 8, 2025**
   - The live counter on the Story finale and the dashboard countdown both currently start from Nov 7, 2025. Both move to Nov 8, 2025.
   - The shared space record in the database gets `anniversary_date = 2025-11-08` so future features read one source of truth.

2. **Replace every placeholder photo with your real ones**
   All 10 uploaded photos get published to CDN storage and wired into the Story page, replacing the generated stand-ins:

   | Section | Photo |
   |---|---|
   | Hero + Finale background | 1_CoverPhoto |
   | Every Moment With You | 2_CuteSelfie, 3_CuteSelfie |
   | Our Favorite Dates | 4_FavCoffee_and_Cafe, 5_BestEver_Maki |
   | Funny & Candid | 7_MaxineOnPole, 8_BruceCloseUp_With_Goggles |
   | Our Journey | 10_FirstEverOuting, 9_MostRecent_Outing |

   Photo 6 (first ever meet with Sachi) currently has no home, so it is added as a third block in "Our Favorite Dates" with a short line about meeting Sachi for the first time. Say the word if you'd rather it go elsewhere or be left out.

   The old generated placeholders in `public/images` are removed so nothing stale ships.

## Technical notes

- Upload each file from the upload mount with `lovable-assets create`, writing pointers to `src/assets/*.asset.json`; components import the pointer and use `.url` instead of the `/images/...` path.
- Date constants updated in `src/components/love/FinaleSection.tsx` and `src/routes/_authenticated/home.tsx`; a small migration/update sets `public.spaces.anniversary_date` to `2025-11-08`.
- No layout, animation, typography, or color changes — only sources, one added block, and the date.
