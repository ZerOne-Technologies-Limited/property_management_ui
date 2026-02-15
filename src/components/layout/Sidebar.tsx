import { Link, useLocation } from "@tanstack/react-router";
import { Home, Receipt, User, Building2 } from "lucide-react";
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

export function Sidebar() {
  const location = useLocation();
  const { properties, loading } = useProperties();
  const selectedPropertyId = useAppStore((state) => state.selectedPropertyId);
  const setSelectedPropertyId = useAppStore((state) => state.setSelectedPropertyId);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-stripe-border bg-stripe-sidebar">
      {/* Business Name / Logo */}
      <div className="flex h-16 items-center border-b border-stripe-border px-6">
        <div className="flex items-center gap-2">
          <Building2 className="size-6 text-stripe-purple" />
          <span className="text-lg font-semibold text-stripe-text-primary">
            BHD
          </span>
        </div>
      </div>

      {/* Property Selector */}
      <div className="border-b border-stripe-border px-4 py-3">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-stripe-text-secondary">
          Property
        </label>
        <select
          className="h-9 w-full rounded-md border border-stripe-border bg-white px-3 text-sm font-medium text-stripe-text-primary focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-1"
          value={selectedPropertyId || ""}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
          disabled={loading}
        >
          <option value="" disabled>
            Select Property
          </option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-stripe-purple-light text-stripe-purple"
                  : "text-stripe-text-primary hover:bg-white/50"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Link */}
      <div className="border-t border-stripe-border px-3 py-4">
        <Link
          to="/profile"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            location.pathname === "/profile"
              ? "bg-stripe-purple-light text-stripe-purple"
              : "text-stripe-text-primary hover:bg-white/50"
          )}
        >
          <User className="size-5" />
          Profile
        </Link>
      </div>
    </div>
  );
}
