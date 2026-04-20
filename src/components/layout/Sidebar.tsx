import { Link, useLocation } from "@tanstack/react-router";
import { Home, Receipt, User, Building2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useProperties } from "../../hooks/useProperties";
import { useAppStore } from "../../lib/store";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Transactions", path: "/transactions", icon: Receipt },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { properties, loading } = useProperties();
  const selectedPropertyId = useAppStore((state) => state.selectedPropertyId);
  const setSelectedPropertyId = useAppStore((state) => state.setSelectedPropertyId);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        // Base — flex column, fixed width
        "flex w-64 shrink-0 flex-col border-r border-stripe-border bg-stripe-sidebar",
        // Mobile: fixed overlay that slides in/out
        "fixed inset-y-0 left-0 z-30 transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: static in the flex flow, always visible
        "md:relative md:inset-y-auto md:left-auto md:z-auto md:translate-x-0 md:h-auto"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-stripe-border px-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-stripe-purple" />
          <span className="text-base font-semibold text-stripe-text-primary">BHD</span>
        </div>

        {/* Close button — mobile only */}
        <button
          className="flex size-8 items-center justify-center rounded-md text-stripe-text-secondary transition-colors hover:bg-white/50 md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Property Selector */}
      <div className="border-b border-stripe-border px-4 py-3">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stripe-text-secondary">
          Property
        </label>
        <select
          className="h-9 w-full rounded-md border border-stripe-border bg-white px-3 text-sm font-medium text-stripe-text-primary focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-1"
          value={selectedPropertyId || ""}
          onChange={(e) => {
            setSelectedPropertyId(e.target.value);
            onClose?.(); // auto-close on mobile after selection
          }}
          disabled={loading}
        >
          <option value="" disabled>Select Property</option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>{prop.name}</option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-stripe-purple-light text-stripe-purple"
                  : "text-stripe-text-primary hover:bg-white/50"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Link */}
      <div className="border-t border-stripe-border px-3 py-3">
        <Link
          to="/profile"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
            location.pathname === "/profile"
              ? "bg-stripe-purple-light text-stripe-purple"
              : "text-stripe-text-primary hover:bg-white/50"
          )}
        >
          <User className="size-4" />
          Profile
        </Link>
      </div>
    </aside>
  );
}
