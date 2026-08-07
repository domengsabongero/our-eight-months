import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SPACE_ID } from "@/lib/keepsake.functions";

export const GALLERY_BUCKET = "gallery";

export type GalleryPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  taken_at: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  author_id: string;
  author_name: string | null;
  url: string | null;
};

const listSchema = z.object({ archived: z.boolean().default(false) });

/** All gallery photos for the shared space, with short-lived signed URLs. */
export const listGallery = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data, context }): Promise<GalleryPhoto[]> => {
    const { supabase } = context;

    const { data: rows, error } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("space_id", SPACE_ID)
      .eq("is_archived", data.archived)
      .order("taken_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    if (!rows?.length) return [];

    const { data: profiles } = await supabase.from("profiles").select("id, display_name");
    const nameOf = (id: string) =>
      profiles?.find((p) => p.id === id)?.display_name ?? null;

    const { data: signed } = await supabase.storage
      .from(GALLERY_BUCKET)
      .createSignedUrls(
        rows.map((r) => r.storage_path),
        60 * 60,
      );

    return rows.map((row, i) => ({
      id: row.id,
      storage_path: row.storage_path,
      caption: row.caption,
      taken_at: row.taken_at,
      is_favorite: row.is_favorite,
      is_archived: row.is_archived,
      created_at: row.created_at,
      author_id: row.author_id,
      author_name: nameOf(row.author_id),
      url: signed?.[i]?.signedUrl ?? null,
    }));
  });

const addSchema = z.object({
  items: z
    .array(
      z.object({
        storagePath: z.string().min(1),
        caption: z.string().max(300).nullable().optional(),
        takenAt: z.string().max(10).nullable().optional(),
      }),
    )
    .min(1),
});

/** Records photos that were just uploaded to the private bucket. */
export const addGalleryItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => addSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("gallery_items").insert(
      data.items.map((item) => ({
        space_id: SPACE_ID,
        author_id: context.userId,
        storage_path: item.storagePath,
        caption: item.caption?.trim() ? item.caption.trim() : null,
        taken_at: item.takenAt ? item.takenAt : null,
      })),
    );
    if (error) throw new Error(error.message);
    return { ok: true as const, count: data.items.length };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  caption: z.string().max(300).nullable().optional(),
  takenAt: z.string().max(10).nullable().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

/** Edits a photo's caption, date, favourite or archived state. */
export const updateGalleryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.caption !== undefined)
      patch['caption'] = data.caption?.trim() ? data.caption.trim() : null;
    if (data.takenAt !== undefined) patch['taken_at'] = data.takenAt || null;
    if (data.isFavorite !== undefined) patch['is_favorite'] = data.isFavorite;
    if (data.isArchived !== undefined) patch['is_archived'] = data.isArchived;

    const { error } = await context.supabase
      .from("gallery_items")
      .update(patch)
      .eq("id", data.id)
      .eq("space_id", SPACE_ID);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const deleteSchema = z.object({ id: z.string().uuid() });

/** Removes a photo and its stored file for good. */
export const deleteGalleryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error: readError } = await context.supabase
      .from("gallery_items")
      .select("storage_path")
      .eq("id", data.id)
      .eq("space_id", SPACE_ID)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!row) throw new Error("That photo no longer exists.");

    const { error } = await context.supabase
      .from("gallery_items")
      .delete()
      .eq("id", data.id)
      .eq("space_id", SPACE_ID);
    if (error) throw new Error(error.message);

    // Either partner may delete a shared photo, so the file removal is done
    // with elevated access after the row check above proved membership.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from(GALLERY_BUCKET).remove([row.storage_path]);

    return { ok: true as const };
  });

/** Count of photos in the album, for the dashboard. */
export const getGalleryCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await context.supabase
      .from("gallery_items")
      .select("id", { count: "exact", head: true })
      .eq("space_id", SPACE_ID)
      .eq("is_archived", false);
    return { count: count ?? 0 };
  });
