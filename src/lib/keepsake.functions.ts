import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The single shared Keepsake space (seeded in the database). */
export const SPACE_ID = "11111111-1111-1111-1111-111111111111";

/** Only two accounts may ever exist in this Keepsake. */
const MAX_MEMBERS = 2;

const claimSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  displayName: z.string().min(1).max(60),
});

/**
 * Creates one of the two closed accounts for this Keepsake.
 * Public signups are disabled at the auth level; this is the only path in,
 * and it stops working once both accounts have been claimed.
 */
export const claimAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => claimSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countError } = await supabaseAdmin
      .from("space_members")
      .select("id", { count: "exact", head: true })
      .eq("space_id", SPACE_ID);
    if (countError) throw new Error(countError.message);

    if ((count ?? 0) >= MAX_MEMBERS) {
      throw new Error(
        "This Keepsake already has its two accounts. Please sign in instead.",
      );
    }

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { display_name: data.displayName },
    });
    if (error || !created.user) {
      throw new Error(error?.message ?? "Could not create the account.");
    }

    const userId = created.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, display_name: data.displayName }, { onConflict: "id" });
    if (profileError) throw new Error(profileError.message);

    const { error: memberError } = await supabaseAdmin
      .from("space_members")
      .upsert(
        { space_id: SPACE_ID, user_id: userId },
        { onConflict: "space_id,user_id" },
      );
    if (memberError) throw new Error(memberError.message);

    await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: userId, role: (count ?? 0) === 0 ? "admin" : "member" },
        { onConflict: "user_id,role" },
      );

    return { ok: true as const };
  });

/** How many of the two accounts are still available. */
export const getClaimStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("space_members")
    .select("id", { count: "exact", head: true })
    .eq("space_id", SPACE_ID);
  const taken = count ?? 0;
  return { seatsLeft: Math.max(0, MAX_MEMBERS - taken) };
});

/** Everything the app shell and dashboard need for the signed-in user. */
export const getKeepsake = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [{ data: space }, { data: profiles }] = await Promise.all([
      supabase.from("spaces").select("*").eq("id", SPACE_ID).maybeSingle(),
      supabase.from("profiles").select("id, display_name, avatar_url, label, birthday"),
    ]);

    const me = profiles?.find((p) => p.id === userId) ?? null;
    const partner = profiles?.find((p) => p.id !== userId) ?? null;

    return {
      userId,
      space: space ?? null,
      me,
      partner,
    };
  });

const profileSchema = z.object({
  displayName: z.string().min(1).max(60),
  label: z.string().max(60).optional(),
  birthday: z.string().max(10).optional(),
});

/** Saves the signed-in user's own profile. */
export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert(
      {
        id: context.userId,
        display_name: data.displayName,
        label: data.label ?? null,
        birthday: data.birthday ? data.birthday : null,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
