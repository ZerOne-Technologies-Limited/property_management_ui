import { Link, useLocation } from "@tanstack/react-router";
import { Home, Receipt, User, Building2, X, Users, ChevronsUpDown, Search, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { useProperties } from "../../hooks/useProperties";
import { useAppStore } from "../../lib/store";
import { useState, useRef, useEffect, useMemo } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Tenants", path: "/tenants", icon: Users },
  { label: "Transactions", path: "/transactions", icon: Receipt },
];

// ─── PropertyCombobox ─────────────────────────────────────────────────────────

interface PropertyComboboxProps {
  properties: import("../../types").Property[];
  loading: boolean;
  value: string | null;
  onChange: (id: string) => void;
}

function PropertyCombobox({ properties, loading, value, onChange }: PropertyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = properties.find(p => p.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(p => p.name.toLowerCase().includes(q));
  }, [properties, query]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-stripe-border bg-white px-3 text-sm font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-1",
          open ? "ring-2 ring-stripe-purple ring-offset-1" : "hover:bg-gray-50",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={cn("truncate", selected ? "text-stripe-text-primary" : "text-stripe-text-secondary")}>
          {loading ? "Loading…" : (selected?.name ?? "Select property")}
        </span>
        <ChevronsUpDown className="ml-2 size-3.5 shrink-0 text-stripe-text-secondary" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-stripe-border bg-white shadow-lg">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-stripe-border px-3 py-2">
            <Search className="size-3.5 shrink-0 text-stripe-text-secondary" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search properties…"
              className="flex-1 bg-transparent text-sm text-stripe-text-primary placeholder:text-stripe-text-secondary focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-stripe-text-secondary hover:text-stripe-text-primary"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Options */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-stripe-text-secondary">
                No properties match "{query}"
              </li>
            ) : (
              filtered.map(p => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p.id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                      p.id === value
                        ? "bg-stripe-purple-light text-stripe-purple font-medium"
                        : "text-stripe-text-primary hover:bg-stripe-sidebar"
                    )}
                  >
                    <span className="flex-1 truncate">{p.name}</span>
                    {p.id === value && <Check className="size-3.5 shrink-0" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

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
          <span className="text-base font-semibold text-stripe-text-primary">ProprtMng</span>
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
        <PropertyCombobox
          properties={properties}
          loading={loading}
          value={selectedPropertyId}
          onChange={(id) => {
            setSelectedPropertyId(id);
            onClose?.();
          }}
        />
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
