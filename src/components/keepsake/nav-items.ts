import {
  BookHeart,
  CalendarHeart,
  Clock,
  Home,
  Images,
  Mail,
  PawPrint,
  Search,
  Settings,
  Sparkles,
  User,
  Wallet,
  Archive,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  /** Shown in the mobile bottom bar. */
  primary?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/home", label: "Home", icon: Home, primary: true },
  { to: "/story", label: "Our Story", icon: BookHeart, primary: true },
  { to: "/letters", label: "Letters", icon: Mail, primary: true },
  { to: "/gallery", label: "Gallery", icon: Images, primary: true },
  { to: "/timeline", label: "Timeline", icon: Sparkles },
  { to: "/pets", label: "Pets", icon: PawPrint },
  { to: "/calendar", label: "Calendar", icon: CalendarHeart },
  { to: "/plans", label: "Plans & Finances", icon: Wallet },
  { to: "/capsules", label: "Time Capsules", icon: Clock },
  { to: "/archive", label: "Archive", icon: Archive },
  { to: "/search", label: "Search", icon: Search, primary: true },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((item) => item.primary);
