import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function AppSidebar({
  displayName,
  onSignOut,
}: {
  displayName: string;
  onSignOut: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="glass-card sticky top-0 hidden h-screen w-64 shrink-0 flex-col rounded-none border-y-0 border-l-0 px-4 py-6 md:flex">
      <Link to="/home" className="px-3">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-rosegold">
          Est. 08.11.2025
        </p>
        <h2 className="text-gradient-rose mt-1 font-serif text-2xl font-medium">
          The Keepsake
        </h2>
      </Link>

      <nav className="mt-8 flex-1 space-y-1 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "text-ink"
                  : "text-muted-foreground hover:bg-white/50 hover:text-ink",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-white/70 shadow-[0_10px_24px_-18px_var(--rosegold)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.icon
                className={cn(
                  "relative z-10 h-4 w-4",
                  active ? "text-rosegold" : "text-rosegold/60",
                )}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/60 pt-4">
        <p className="px-3 font-serif text-base text-ink">{displayName}</p>
        <button
          onClick={onSignOut}
          className="mt-2 w-full rounded-2xl px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:bg-white/50 hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
