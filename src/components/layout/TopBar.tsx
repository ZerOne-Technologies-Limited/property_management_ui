import { Search, Bell, Settings, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAppStore } from "../../lib/store";
import { Input } from "../ui/input";

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const user = useAppStore((state) => state.user);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="sticky top-0 z-30 flex h-14 w-full items-center gap-3 border-b border-stripe-header/20 bg-stripe-header px-4">

      {/* Hamburger — mobile only */}
      <button
        className="flex size-8 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Brand */}
      <span className="text-base font-semibold text-white sm:text-lg">ProprtMng</span>

      <div className="flex-1" />

      {/* Search — hidden on mobile */}
      <div className="relative hidden md:block w-56 lg:w-64">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stripe-text-secondary" />
        <Input
          className="h-8 border-0 bg-white/10 pl-9 text-sm text-white placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/20"
          placeholder="Search..."
        />
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-1">
        {/* Notifications — always visible */}
        <button
          className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>

        {/* Settings — desktop only */}
        <Link
          to="/settings"
          className="hidden md:flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Settings"
        >
          <Settings className="size-4" />
        </Link>

        {/* User avatar */}
        <Link
          to="/profile"
          className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Profile"
        >
          <span className="text-xs font-semibold">{initials}</span>
        </Link>
      </div>
    </div>
  );
}
