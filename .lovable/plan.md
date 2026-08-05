# The Keepsake — Version 2.0 Foundation

Turn the existing monthsary page into a private, sign-in-only app for you and Maxine, without touching the romantic experience you already have. This phase builds the shell: accounts, database, navigation, and empty rooms ready to furnish later.

## What changes for you

- Visiting the site shows an elegant "The Keepsake" sign-in screen (email + password). No public signup — only the two accounts we create.
- After signing in, you land on a **Home** dashboard.
- The entire current monthsary page moves to **/story**, unchanged: same hero, animations, letter, typewriter, floating hearts, photos, fonts, colors.
- Desktop gets a collapsible sidebar; mobile gets a bottom navigation bar with the main destinations.
- Every listed page exists and is reachable, styled in the same aesthetic, with a graceful "coming soon" state.

## Pages created (placeholders except Story)

Home (dashboard), Story (the full existing experience), Letters, Gallery, Timeline, Pets, Calendar, Plans & Finances, Time Capsules, Archive, Search, Profile, Settings.

## Backend foundation

Lovable Cloud is enabled to provide the database, authentication, and file storage.

- **Profiles**: display name, avatar, role/label, birthday, joined date — created automatically on signup.
- **Couple space**: a shared space both accounts belong to, so all future content (letters, photos, plans) is scoped to the two of you.
- **Schema prepared for later phases** (tables created now, unused until their page is built): letters, gallery_items, timeline_events, pets, calendar_events, plans, transactions, time_capsules.
- **Row Level Security** on every table: a row is readable/writable only by members of the couple space it belongs to. Roles live in a separate table, never on profiles.
- **Storage**: private buckets for `avatars`, `gallery`, and `pets`, with policies allowing access only to signed-in members.

## Design system

- Extract the existing rose-gold / cream / ink palette, Playfair + Cormorant + Inter typography, and glass-card treatment into documented tokens in `src/styles.css` — no visual change to what exists.
- Reusable components: `PageShell`, `PageHeader`, `KeepsakeCard`, `EmptyState`, `ComingSoon`, `StatTile`, plus the sidebar and bottom-nav.

## Technical notes

- This project runs on **TanStack Start** (file-based routing under `src/routes`), not Next.js — an App Router isn't applicable, so the equivalent structure is used: a public `/auth` route and an `_authenticated/` layout gating every app page.
- `src/routes/index.tsx` becomes the sign-in landing (redirects to `/home` when a session exists). The current page body moves to `src/routes/_authenticated/story.tsx` importing the untouched `src/components/love/*` components.
- App chrome lives in `src/routes/_authenticated/route.tsx`: sidebar on `md+`, fixed bottom nav below, `<Outlet />` in between.
- Auth via Lovable Cloud email/password with auto-confirm enabled (only two known accounts), a `profiles` table with an insert trigger, and sign-out hygiene (cancel queries, clear cache, replace history).
- Each route gets its own `head()` metadata; app pages are `noindex` since they're private.

## Out of scope this phase

No real functionality inside Letters, Gallery, Timeline, Pets, Calendar, Plans & Finances, Time Capsules, Archive, or Search — those come in later phases.
