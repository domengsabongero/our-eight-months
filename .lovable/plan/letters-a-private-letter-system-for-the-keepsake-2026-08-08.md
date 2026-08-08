# Letters — a private letter system for The Keepsake

Turns the Letters placeholder into a working, recipient-private letter module, reusing the existing Keepsake design system, auth, couple space, Gallery patterns and navigation. Nothing about Story, Gallery, dashboard styling or the visual language changes.

## What you'll be able to do

- Write a letter to your partner in a calm, focused composer: title, body with light formatting, an optional date, an optional scheduled delivery time, favourite, and image attachments.
- Save it as a draft, come back later, keep editing (autosaved), then send it.
- Your partner sees it in their Inbox, unread and visually distinct; opening it marks it read, and you can see on your Sent view that it was opened.
- Favourite and archive letters privately — your favourites and archive are yours alone.
- Schedule a letter for the future; until that moment it stays in your Scheduled list and is genuinely unreachable for the recipient, not just hidden.
- Drafts are never visible to the other person.

## Page structure

The Letters page keeps `PageShell` and gains quiet tabs: Inbox, Sent, Drafts, Scheduled, Favourites, Archived. Letter cards show sender or recipient, title, a short plain-text preview, date, unread dot, favourite state, and a scheduled or opened marker. Reading opens a dedicated, unhurried letter view (full-screen sheet on mobile) with title, author, date, body, attachments, and favourite/archive actions using the existing FadeUp animation only.

Empty states use your wording exactly, e.g. Inbox: "No letters yet. The first one is waiting to be written."

## Privacy model

Enforced in the database, not the interface:

- The author can always reach their own letters, including drafts and scheduled ones.
- The recipient can reach a letter only once it is sent and its delivery time has passed.
- Nobody can reach a letter outside your shared space.
- Author and recipient cannot be changed after creation, and you cannot send a letter to yourself.
- Attachments are readable only by people who can read the parent letter, and files live in a private bucket served through short-lived signed links.

## Technical detail

**Database (one migration).** The existing `letters` table is reused and extended: `recipient_id` (references auth.users, not equal to author), `status` ('draft' | 'sent'), `scheduled_for`, `sent_at`, `read_at`. `mood` stays. Any existing rows are backfilled as sent letters to the other member. The shared `is_archived`/global-favourite path is replaced by a per-user `letter_states` table (`letter_id`, `user_id`, `is_favorite`, `archived_at`) so favourites and archive are personal. A new `letter_attachments` table (`letter_id`, `storage_path`, `caption`) plus a new private `letters` storage bucket handle images. A `timeline_event_id`/`letter_id` reference is added so Timeline can later surface letters without building Timeline now.

**RLS.** The current space-wide read/update/delete policies on `letters` are dropped and replaced:
- SELECT: `author_id = auth.uid()` OR (`recipient_id = auth.uid()` AND `status = 'sent'` AND (`scheduled_for` is null OR `scheduled_for <= now()`)), always with `is_space_member(space_id, auth.uid())`.
- INSERT/UPDATE/DELETE: author only; a trigger blocks changes to `space_id`, `author_id`, `recipient_id`, and blocks edits to body/title once sent. A security-definer `can_read_letter(letter_id, user_id)` helper backs `letter_states` and `letter_attachments` policies. GRANTs are issued for `authenticated` and `service_role` on every new table; `updated_at` triggers reuse `set_updated_at`.

**Server functions.** New `src/lib/letters.functions.ts` following the Gallery pattern (`createServerFn` + `requireSupabaseAuth`): `listLetters({ box })`, `getLetter({ id })` (marks read for the recipient), `saveDraft`, `sendLetter`, `deleteDraft`, `setLetterState` (favourite/archive), `addLetterAttachments`, `getLetterSummary` for the dashboard. Attachment uploads go browser-to-storage like `UploadDialog`, then get recorded server-side.

**UI.** New components under `src/components/keepsake/letters/`: `LetterList`, `LetterCard`, `LetterReader`, `ComposeDialog`, and a small `RichText` editor (bold, italic, headings, lists, quote, link) built on `contentEditable` with the existing tokens — sanitised on the server before storage and rendered from sanitised HTML. No new heavy editor dependency.

**Dashboard.** `home.tsx` gains an unread count, latest received letter, most recent sent letter, scheduled count, and a "Write a letter" quick action, added alongside the existing widgets without altering them.

**Queries.** TanStack Query keys `["letters", box]` and `["letters", "detail", id]`, invalidated on save, send, delete, favourite, archive and read — no polling.

**Verification.** Playwright end-to-end run through the full Definition of Done with both accounts, plus direct API checks that the other member cannot read a draft or a not-yet-delivered scheduled letter or its attachment. Any test data is removed afterwards.
