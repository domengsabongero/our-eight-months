import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "./nav-items";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="glass-card fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around rounded-none rounded-t-[1.75rem] border-x-0 border-b-0 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      {PRIMARY_NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[0.6rem] uppercase tracking-[0.12em] transition-colors",
              active ? "text-rosegold" : "text-muted-foreground",
            )}
          >
            <item.icon className={cn("h-5 w-5", active && "scale-110")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
