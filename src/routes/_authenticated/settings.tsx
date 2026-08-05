import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";

import { FadeUp } from "@/components/love/FadeUp";
import { PageShell } from "@/components/keepsake/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — The Keepsake" },
      { name: "description", content: "Preferences and account options for our Keepsake." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Settings — The Keepsake" },
      { property: "og:description", content: "Preferences and account options." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <PageShell
      eyebrow="Settings"
      title="Our preferences"
      intro="This Keepsake is private to the two of us. More controls will arrive as we add each room."
    >
      <FadeUp>
        <div className="glass-card max-w-lg space-y-6 rounded-[2rem] px-7 py-9">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70">
              <SettingsIcon className="h-5 w-5 text-rosegold" />
            </span>
            <div>
              <p className="font-serif text-lg text-ink">Private by design</p>
              <p className="text-sm text-muted-foreground">
                Only our two accounts can ever sign in here.
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full rounded-full border border-rosegold/40 px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-rosegold transition-colors hover:bg-white/60"
          >
            Sign out
          </button>
        </div>
      </FadeUp>
    </PageShell>
  );
}
