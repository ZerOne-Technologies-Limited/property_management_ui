import { Search, HelpCircle, Bell, Settings, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAppStore } from "../../lib/store";
import { Input } from "../ui/input";

export function TopBar() {
  const user = useAppStore((state) => state.user);

  // Get user initials for avatar
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-stripe-header/20 bg-stripe-header px-6">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-white">ProptyMng</span>
      </div>

      {/* Info Banner (optional - can be removed if not needed) */}
      {/* <div className="ml-4 flex items-center gap-2 rounded-md bg-stripe-banner px-3 py-1.5">
        <span className="text-xs font-medium text-stripe-banner-text">
          You're testing in a sandbox environment
        </span>
      </div> */}

      <div className="flex-1" />

      {/* Global Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stripe-text-secondary" />
        <Input
          className="h-9 border-0 bg-white/10 pl-9 text-sm text-white placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/20"
          placeholder="Search..."
        />
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-2">
        <button
          className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Help"
        >
          <HelpCircle className="size-5" />
        </button>
        <button
          className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>
        <button
          className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Settings"
        >
          <Settings className="size-5" />
        </button>
        <button
          className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Add"
        >
          <Plus className="size-5" />
        </button>
      </div>

      {/* User Profile */}
      <Link
        to="/profile"
        className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Profile"
      >
        <span className="text-xs font-semibold">{initials}</span>
      </Link>
    </div>
  );
}
