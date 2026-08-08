import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SPACE_ID } from "@/lib/keepsake.functions";
import { letterPreview, sanitizeLetterHtml } from "@/lib/letters-sanitize";

export const LETTERS_BUCKET = "letters";

export type LetterBox =
  | "inbox"
  | "sent"
  | "drafts"
  | "scheduled"
  | "favorites"
  | "archived";

export type LetterCardData = {
  id: string;
  title: string;
  preview: string;
  mood: string | null;
  status: "draft" | "sent";
  scheduled_for: string | null;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
  recipient_id: string;
  author_name: string | null;
  recipient_name: string | null;
  is_mine: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  is_unread: boolean;
  is_pending: boolean;
  attachment_count: number;
};

export type LetterDetail = LetterCardData & {
  body: string;
  attachments: { id: string; caption: string | null; url: string | null }[];
};

type Row = {
  id: string;
  space_id: string;
  author_id: string;
  recipient_id: string;
  title: string;
  body: string;
  mood: string | null;
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

const LETTER_COLUMNS =
  "id, space_id, author_id, recipient_id, title, body, mood, status, scheduled_for, sent_at, read_at, created_at, updated_at";

function isPending(row: Row) {
  return (
    row.status === "sent" &&
    !!row.scheduled_for &&
    new Date(row.scheduled_for).getTime() > Date.now()
  );
}

const listSchema = z.object({
  box: z
    .enum(["inbox", "sent", "drafts", "scheduled", "favorites", "archived"])
    .default("inbox"),
});

/** Letters for one of the mailbox views, scoped by RLS to what the user may read. */
export const listLetters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data, context }): Promise<LetterCardData[]> => {
    const { supabase, userId } = context;

    const { data: rows, error } = await supabase
      .from("letters")
      .select(LETTER_COLUMNS)
      .eq("space_id", SPACE_ID)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    if (!rows?.length) return [];

    const [{ data: profiles }, { data: states }, { data: attachments }] =
      await Promise.all([
        supabase.from("profiles").select("id, display_name"),
        supabase.from("letter_states").select("letter_id, is_favorite, archived_at"),
        supabase.from("letter_attachments").select("id, letter_id"),
      ]);

    const nameOf = (id: string) =>
      profiles?.find((p) => p.id === id)?.display_name ?? null;

    const cards = (rows as Row[]).map((row): LetterCardData => {
      const state = states?.find((s) => s.letter_id === row.id);
      const mine = row.author_id === userId;
      return {
        id: row.id,
        title: row.title,
        preview: letterPreview(row.body),
        mood: row.mood,
        status: row.status === "sent" ? "sent" : "draft",
        scheduled_for: row.scheduled_for,
        sent_at: row.sent_at,
        read_at: row.read_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        author_id: row.author_id,
        recipient_id: row.recipient_id,
        author_name: nameOf(row.author_id),
        recipient_name: nameOf(row.recipient_id),
        is_mine: mine,
        is_favorite: state?.is_favorite ?? false,
        is_archived: !!state?.archived_at,
        is_unread: !mine && row.status === "sent" && !row.read_at,
        is_pending: isPending(row),
        attachment_count:
          attachments?.filter((a) => a.letter_id === row.id).length ?? 0,
      };
    });

    switch (data.box) {
      case "inbox":
        return cards.filter(
          (c) => !c.is_mine && c.status === "sent" && !c.is_pending && !c.is_archived,
        );
      case "sent":
        return cards.filter(
          (c) => c.is_mine && c.status === "sent" && !c.is_pending && !c.is_archived,
        );
      case "drafts":
        return cards.filter((c) => c.is_mine && c.status === "draft");
      case "scheduled":
        return cards.filter((c) => c.is_mine && c.is_pending);
      case "favorites":
        return cards.filter((c) => c.is_favorite && !c.is_archived);
      case "archived":
        return cards.filter((c) => c.is_archived);
      default:
        return cards;
    }
  });

const getSchema = z.object({ id: z.string().uuid() });

/** One letter with its attachments; marks it read for the recipient. */
export const getLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => getSchema.parse(input))
  .handler(async ({ data, context }): Promise<LetterDetail> => {
    const { supabase, userId } = context;

    const { data: row, error } = await supabase
      .from("letters")
      .select(LETTER_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("That letter isn't available.");
    const letter = row as Row;

    const mine = letter.author_id === userId;
    if (!mine && !letter.read_at && letter.status === "sent") {
      const readAt = new Date().toISOString();
      const { error: readError } = await supabase
        .from("letters")
        .update({ read_at: readAt })
        .eq("id", letter.id);
      if (!readError) letter.read_at = readAt;
    }

    const [{ data: profiles }, { data: states }, { data: files }] = await Promise.all([
      supabase.from("profiles").select("id, display_name"),
      supabase
        .from("letter_states")
        .select("is_favorite, archived_at")
        .eq("letter_id", letter.id)
        .maybeSingle(),
      supabase
        .from("letter_attachments")
        .select("id, storage_path, caption")
        .eq("letter_id", letter.id)
        .order("created_at", { ascending: true }),
    ]);

    const nameOf = (id: string) =>
      profiles?.find((p) => p.id === id)?.display_name ?? null;

    let signed: { signedUrl: string | null }[] | null = null;
    if (files?.length) {
      const { data: urls } = await supabase.storage
        .from(LETTERS_BUCKET)
        .createSignedUrls(
          files.map((f) => f.storage_path),
          60 * 60,
        );
      signed = urls ?? null;
    }

    return {
      id: letter.id,
      title: letter.title,
      preview: letterPreview(letter.body),
      body: letter.body,
      mood: letter.mood,
      status: letter.status === "sent" ? "sent" : "draft",
      scheduled_for: letter.scheduled_for,
      sent_at: letter.sent_at,
      read_at: letter.read_at,
      created_at: letter.created_at,
      updated_at: letter.updated_at,
      author_id: letter.author_id,
      recipient_id: letter.recipient_id,
      author_name: nameOf(letter.author_id),
      recipient_name: nameOf(letter.recipient_id),
      is_mine: mine,
      is_favorite: states?.is_favorite ?? false,
      is_archived: !!states?.archived_at,
      is_unread: false,
      is_pending: isPending(letter),
      attachment_count: files?.length ?? 0,
      attachments: (files ?? []).map((f, i) => ({
        id: f.id,
        caption: f.caption,
        url: signed?.[i]?.signedUrl ?? null,
      })),
    };
  });

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().max(160).default(""),
  body: z.string().max(60000).default(""),
  mood: z.string().trim().max(60).nullable().optional(),
  scheduledFor: z.string().max(40).nullable().optional(),
});

/** Creates or updates the signed-in user's draft. Recipient is always the partner. */
export const saveDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const patch = {
      title: data.title.trim() || "Untitled letter",
      body: sanitizeLetterHtml(data.body),
      mood: data.mood?.trim() ? data.mood.trim() : null,
      scheduled_for: data.scheduledFor ? new Date(data.scheduledFor).toISOString() : null,
    };

    if (data.id) {
      const { data: row, error } = await supabase
        .from("letters")
        .update(patch)
        .eq("id", data.id)
        .eq("author_id", userId)
        .eq("status", "draft")
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!row) throw new Error("That draft can no longer be edited.");
      return { id: row.id };
    }

    const { data: members, error: memberError } = await supabase
      .from("space_members")
      .select("user_id")
      .eq("space_id", SPACE_ID);
    if (memberError) throw new Error(memberError.message);
    const partner = members?.find((m) => m.user_id !== userId)?.user_id;
    if (!partner) throw new Error("Your partner hasn't claimed their account yet.");

    const { data: row, error } = await supabase
      .from("letters")
      .insert({
        space_id: SPACE_ID,
        author_id: userId,
        recipient_id: partner,
        status: "draft",
        ...patch,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

const sendSchema = z.object({
  id: z.string().uuid(),
  scheduledFor: z.string().max(40).nullable().optional(),
});

/** Turns a draft into a sent (or scheduled) letter. */
export const sendLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => sendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: row, error: readError } = await supabase
      .from("letters")
      .select("id, body, status")
      .eq("id", data.id)
      .eq("author_id", userId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!row) throw new Error("That letter isn't available.");
    if (row.status === "sent") throw new Error("This letter has already been sent.");
    if (!letterPreview(row.body)) throw new Error("Write something first.");

    const { error } = await supabase
      .from("letters")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        scheduled_for: data.scheduledFor
          ? new Date(data.scheduledFor).toISOString()
          : null,
      })
      .eq("id", data.id)
      .eq("author_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const stateSchema = z.object({
  letterId: z.string().uuid(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

/** Personal favourite / archive state — never shared with the other member. */
export const setLetterState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => stateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from("letter_states")
      .select("id, is_favorite, archived_at")
      .eq("letter_id", data.letterId)
      .maybeSingle();

    const nextFavorite = data.isFavorite ?? existing?.is_favorite ?? false;
    const nextArchived =
      data.isArchived === undefined
        ? (existing?.archived_at ?? null)
        : data.isArchived
          ? (existing?.archived_at ?? new Date().toISOString())
          : null;

    if (existing) {
      const { error } = await supabase
        .from("letter_states")
        .update({ is_favorite: nextFavorite, archived_at: nextArchived })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("letter_states").insert({
        letter_id: data.letterId,
        user_id: userId,
        is_favorite: nextFavorite,
        archived_at: nextArchived,
      });
      if (error) throw new Error(error.message);
    }

    return { ok: true as const };
  });

const attachSchema = z.object({
  letterId: z.string().uuid(),
  items: z
    .array(
      z.object({
        storagePath: z.string().min(1).max(300),
        caption: z.string().max(200).nullable().optional(),
      }),
    )
    .min(1)
    .max(10),
});

/** Records images that were just uploaded into the private letters bucket. */
export const addLetterAttachments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => attachSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("letter_attachments").insert(
      data.items.map((item) => ({
        letter_id: data.letterId,
        author_id: context.userId,
        storage_path: item.storagePath,
        caption: item.caption?.trim() ? item.caption.trim() : null,
      })),
    );
    if (error) throw new Error(error.message);
    return { ok: true as const, count: data.items.length };
  });

const deleteAttachmentSchema = z.object({ id: z.string().uuid() });

/** Removes one attachment and its stored file. */
export const deleteLetterAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteAttachmentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("letter_attachments")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await context.supabase
      .from("letter_attachments")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    if (row) {
      await context.supabase.storage.from(LETTERS_BUCKET).remove([row.storage_path]);
    }
    return { ok: true as const };
  });

const deleteSchema = z.object({ id: z.string().uuid() });

/** Deletes one of the author's own drafts, with any attached files. */
export const deleteDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: letter } = await supabase
      .from("letters")
      .select("id, status")
      .eq("id", data.id)
      .eq("author_id", userId)
      .maybeSingle();
    if (!letter) throw new Error("That draft isn't available.");
    if (letter.status !== "draft") throw new Error("Sent letters cannot be deleted.");

    const { data: files } = await supabase
      .from("letter_attachments")
      .select("storage_path")
      .eq("letter_id", data.id);

    const { error } = await supabase
      .from("letters")
      .delete()
      .eq("id", data.id)
      .eq("author_id", userId);
    if (error) throw new Error(error.message);

    if (files?.length) {
      await supabase.storage
        .from(LETTERS_BUCKET)
        .remove(files.map((f) => f.storage_path));
    }
    return { ok: true as const };
  });

/** Small roll-up for the dashboard. */
export const getLettersSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: rows } = await supabase
      .from("letters")
      .select(
        "id, title, body, author_id, recipient_id, status, scheduled_for, sent_at, read_at, created_at",
      )
      .eq("space_id", SPACE_ID)
      .order("sent_at", { ascending: false, nullsFirst: false });

    const { data: profiles } = await supabase.from("profiles").select("id, display_name");
    const nameOf = (id: string) =>
      profiles?.find((p) => p.id === id)?.display_name ?? null;

    const all = rows ?? [];
    const delivered = (r: (typeof all)[number]) =>
      r.status === "sent" &&
      (!r.scheduled_for || new Date(r.scheduled_for).getTime() <= Date.now());

    const received = all.filter((r) => r.recipient_id === userId && delivered(r));
    const sent = all.filter((r) => r.author_id === userId && delivered(r));
    const scheduled = all.filter(
      (r) => r.author_id === userId && r.status === "sent" && !delivered(r),
    );
    const drafts = all.filter((r) => r.author_id === userId && r.status === "draft");

    const brief = (r: (typeof all)[number] | undefined) =>
      r
        ? {
            id: r.id,
            title: r.title,
            preview: letterPreview(r.body, 90),
            date: r.sent_at ?? r.created_at,
            read_at: r.read_at,
            author_name: nameOf(r.author_id),
            recipient_name: nameOf(r.recipient_id),
          }
        : null;

    return {
      unread: received.filter((r) => !r.read_at).length,
      draftCount: drafts.length,
      scheduledCount: scheduled.length,
      latestReceived: brief(received[0]),
      latestSent: brief(sent[0]),
      nextScheduled: scheduled.length
        ? {
            ...brief(scheduled[scheduled.length - 1])!,
            scheduled_for: scheduled[scheduled.length - 1]!.scheduled_for,
          }
        : null,
    };
  });
