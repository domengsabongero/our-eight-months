import { useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { AppSidebar } from "@/components/keepsake/AppSidebar";
import { BottomNav } from "@/components/keepsake/BottomNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/" });
    return { user: data.user };
  },
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("You");

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const meta = data.user?.user_metadata as { display_name?: string } | undefined;
      setDisplayName(meta?.display_name || data.user?.email?.split("@")[0] || "You");
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }, [navigate, queryClient]);

  return (
    <div className="relative flex min-h-screen w-full bg-cream-glow">
      <AppSidebar displayName={displayName} onSignOut={handleSignOut} />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
