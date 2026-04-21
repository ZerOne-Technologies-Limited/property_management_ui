import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RoomRow } from "./RoomRow";
import { useAppStore } from "../../lib/store";
import { useRooms } from "../../hooks/useRooms";
import { useProperties } from "../../hooks/useProperties";
import { AddRoomDialog } from "./AddRoomDialog";
import { X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { savePropertyFilter } from "../../api/axios";


// ─── Date helpers ────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/** "2026-05-01" → "01-May-2026" */
function fmtDDMMMYYYY(iso: string) {
    const [y, m, d] = iso.split("-");
    return `${d}-${MONTHS[Number(m) - 1]}-${y}`;
}

/** "2026-05" → "May-2026" */
function fmtMMMYYYY(v: string) {
    const [y, m] = v.split("-").map(Number);
    return `${MONTHS[m - 1]}-${y}`;
}

function toDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function currentMonthValue() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}

function monthToRange(v: string) {
    const [y, m] = v.split("-").map(Number);
    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    const to = `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
    return { from, to };
}

function monthLabel(v: string) {
    return fmtMMMYYYY(v);
}

function shiftMonth(v: string, delta: number) {
    const [y, m] = v.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ISO week helpers
function isoWeekNum(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function isoWeekYear(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    return d.getUTCFullYear();
}

function currentWeekValue() {
    const n = new Date();
    return `${isoWeekYear(n)}-W${String(isoWeekNum(n)).padStart(2, "0")}`;
}

function weekToRange(v: string) {
    const [yearStr, weekPart] = v.split("-W");
    const year = Number(yearStr);
    const week = Number(weekPart);
    // Jan 4 is always in ISO week 1
    const jan4 = new Date(year, 0, 4);
    const dayOffset = (jan4.getDay() + 6) % 7; // 0=Mon…6=Sun
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - dayOffset + (week - 1) * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: toDateStr(monday), to: toDateStr(sunday) };
}

function weekLabel(v: string) {
    const { from, to } = weekToRange(v);
    return `${fmtDDMMMYYYY(from)} → ${fmtDDMMMYYYY(to)}`;
}

function shiftWeek(v: string, delta: number) {
    const { from } = weekToRange(v);
    const d = new Date(from + "T00:00:00");
    d.setDate(d.getDate() + delta * 7);
    return `${isoWeekYear(d)}-W${String(isoWeekNum(d)).padStart(2, "0")}`;
}

// ─── DateInput ────────────────────────────────────────────────────────────────
// Styled wrapper around a native date input. Shows the formatted date as a
// read-only label; clicking it programmatically opens the picker via showPicker()
// (Chrome/Firefox/Edge 99+) with a direct-click fallback for other browsers.

interface DateInputProps {
    value: string | null;
    onChange: (v: string | null) => void;
    placeholder: string;
}

function DateInput({ value, onChange, placeholder }: DateInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const openPicker = () => {
        const el = inputRef.current;
        if (!el) return;
        if (typeof (el as any).showPicker === "function") {
            try { (el as any).showPicker(); } catch { el.focus(); }
        } else {
            el.focus();
        }
    };

    return (
        <div className="relative">
            {/* Styled button — full click target, no invisible element on top */}
            <button
                type="button"
                onClick={openPicker}
                className={cn(
                    "flex h-7 min-w-[120px] items-center rounded-md border border-stripe-border bg-white px-2.5 text-xs font-medium transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-stripe-purple/40",
                    value ? "text-stripe-text-primary" : "text-stripe-text-secondary"
                )}
            >
                {value ? fmtDDMMMYYYY(value) : placeholder}
            </button>
            {/* Native input tucked out of the way — 1px, pointer-events-none,
                only here so showPicker() has a real DOM node to act on */}
            <input
                ref={inputRef}
                type="date"
                value={value ?? ""}
                onChange={e => onChange(e.target.value || null)}
                tabIndex={-1}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
            />
        </div>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterMode = "month" | "week" | "custom";

export interface FilterSaveState {
    mode: FilterMode;
    monthVal: string;
    weekVal: string;
    customFrom: string | null;
    customTo: string | null;
}

const MODE_LABELS: Record<FilterMode, string> = {
    month: "Month",
    week: "Week",
    custom: "Custom",
};

// ─── DateFilterBar ────────────────────────────────────────────────────────────

interface DateFilterBarProps {
    initialState?: FilterSaveState;
    onFilterChange?: (state: FilterSaveState) => void;
}

function DateFilterBar({ initialState, onFilterChange }: DateFilterBarProps) {
    const dateFilter = useAppStore(state => state.dateFilter);
    const setDateFilter = useAppStore(state => state.setDateFilter);

    const [mode, setMode] = useState<FilterMode>(initialState?.mode ?? "month");
    const [monthVal, setMonthVal] = useState(initialState?.monthVal ?? currentMonthValue());
    const [weekVal, setWeekVal] = useState(initialState?.weekVal ?? currentWeekValue());

    // Apply the range whenever the active picker value changes
    useEffect(() => {
        if (mode === "month") {
            const { from, to } = monthToRange(monthVal);
            setDateFilter(from, to);
        } else if (mode === "week") {
            const { from, to } = weekToRange(weekVal);
            setDateFilter(from, to);
        } else if (mode === "custom" && initialState?.mode === "custom") {
            // Restore custom range from saved state on first render
            setDateFilter(initialState.customFrom, initialState.customTo);
        }
        // custom (non-restore): user drives via the raw inputs
    }, [mode, monthVal, weekVal]); // eslint-disable-line react-hooks/exhaustive-deps

    // Notify parent whenever any part of the filter state changes so it can persist it
    useEffect(() => {
        if (!onFilterChange) return;
        onFilterChange({
            mode,
            monthVal,
            weekVal,
            customFrom: mode === "custom" ? (dateFilter.from ?? null) : null,
            customTo: mode === "custom" ? (dateFilter.to ?? null) : null,
        });
    }, [mode, monthVal, weekVal, dateFilter.from, dateFilter.to]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleModeChange = (m: FilterMode) => {
        setMode(m);
        if (m === "custom") {
            setDateFilter(null, null);
        }
    };

    const handleClear = () => {
        setDateFilter(null, null);
        setMode("month");
        setMonthVal(currentMonthValue());
        setWeekVal(currentWeekValue());
    };

    const hasFilter = dateFilter.from || dateFilter.to;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Mode tabs */}
            <div className="flex rounded-md border border-stripe-border overflow-hidden text-xs font-medium">
                {(["month", "week", "custom"] as FilterMode[]).map(m => (
                    <button
                        key={m}
                        onClick={() => handleModeChange(m)}
                        className={cn(
                            "px-3 py-1.5 transition-colors",
                            mode === m
                                ? "bg-stripe-purple text-white"
                                : "bg-white text-stripe-text-secondary hover:bg-stripe-sidebar"
                        )}
                    >
                        {MODE_LABELS[m]}
                    </button>
                ))}
            </div>

            {/* Month picker — chevron nav only (no native type="month" for cross-browser compat) */}
            {mode === "month" && (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setMonthVal(v => shiftMonth(v, -1))}
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="size-3.5" />
                    </Button>
                    <span className="min-w-[88px] rounded-md border border-stripe-border bg-white px-2.5 py-1 text-center text-xs font-medium text-stripe-text-primary select-none">
                        {monthLabel(monthVal)}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setMonthVal(v => shiftMonth(v, 1))}
                        aria-label="Next month"
                    >
                        <ChevronRight className="size-3.5" />
                    </Button>
                </div>
            )}

            {/* Week picker — chevron nav only (no native type="week" for cross-browser compat) */}
            {mode === "week" && (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setWeekVal(v => shiftWeek(v, -1))}
                        aria-label="Previous week"
                    >
                        <ChevronLeft className="size-3.5" />
                    </Button>
                    <span className="min-w-[180px] rounded-md border border-stripe-border bg-white px-2.5 py-1 text-center text-xs font-medium text-stripe-text-primary select-none hidden sm:inline-block">
                        {weekLabel(weekVal)}
                    </span>
                    <span className="min-w-[80px] rounded-md border border-stripe-border bg-white px-2.5 py-1 text-center text-xs font-medium text-stripe-text-primary select-none sm:hidden">
                        {weekVal}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setWeekVal(v => shiftWeek(v, 1))}
                        aria-label="Next week"
                    >
                        <ChevronRight className="size-3.5" />
                    </Button>
                </div>
            )}

            {/* Custom interval */}
            {mode === "custom" && (
                <div className="flex items-center gap-1.5">
                    <DateInput
                        value={dateFilter.from}
                        onChange={v => setDateFilter(v, dateFilter.to)}
                        placeholder="From date"
                    />
                    <span className="text-xs text-stripe-text-secondary">→</span>
                    <DateInput
                        value={dateFilter.to}
                        onChange={v => setDateFilter(dateFilter.from, v)}
                        placeholder="To date"
                    />
                </div>
            )}

            {/* Clear */}
            {hasFilter && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs text-stripe-text-secondary hover:text-stripe-text-primary"
                    onClick={handleClear}
                >
                    <X className="size-3" />
                    Clear
                </Button>
            )}
        </div>
    );
}

// ─── HierarchyGrid ────────────────────────────────────────────────────────────

export function HierarchyGrid() {
    const selectedPropertyId = useAppStore(state => state.selectedPropertyId);
    const { rooms, loading: loadingRooms } = useRooms(selectedPropertyId || "");
    const { properties } = useProperties();
    const [searchQuery, setSearchQuery] = useState("");

    // Parse the saved filter state for the currently-selected property
    const savedFilterState = useMemo<FilterSaveState | undefined>(() => {
        const raw = properties.find(p => p.id === selectedPropertyId)?.dashboard_filter_state;
        if (!raw) return undefined;
        try { return JSON.parse(raw) as FilterSaveState; } catch { return undefined; }
    }, [properties, selectedPropertyId]);

    // Debounced save – fires 800 ms after the last filter change
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleFilterChange = useCallback((state: FilterSaveState) => {
        if (!selectedPropertyId) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            savePropertyFilter(selectedPropertyId, JSON.stringify(state));
        }, 800);
    }, [selectedPropertyId]);

    if (loadingRooms) {
        return <div className="p-8 text-center text-stripe-text-secondary">Loading data…</div>;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Sticky header: date filter + search + add room */}
            <div className="sticky top-0 z-10 border-b border-stripe-border bg-white">
                {/* Row 1 — Date filter & Add Room */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3 border-b border-stripe-border/50">
                    <DateFilterBar
                        key={selectedPropertyId ?? "none"}
                        initialState={savedFilterState}
                        onFilterChange={handleFilterChange}
                    />
                    <AddRoomDialog />
                </div>

                {/* Row 2 — Student search */}
                <div className="px-3 py-2 sm:px-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-stripe-text-secondary pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search student by name…"
                            className="h-8 w-full rounded-md border border-stripe-border bg-white pl-8 pr-8 text-sm text-stripe-text-primary placeholder:text-stripe-text-secondary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40 focus:border-stripe-purple/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary"
                                aria-label="Clear search"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Column headers — desktop */}
            <div className="hidden sm:grid grid-cols-8 gap-4 border-b border-stripe-border bg-stripe-sidebar px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">
                <div className="col-span-3 pl-8">Name</div>
                <div className="col-span-2">Capacity</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1 text-right">Action</div>
            </div>
            {/* Column headers — mobile */}
            <div className="sm:hidden flex items-center justify-between border-b border-stripe-border bg-stripe-sidebar px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">
                <span>Name</span>
                <span>Total</span>
            </div>

            {/* Room rows */}
            <div className="flex flex-col overflow-y-auto flex-1">
                {rooms.length > 0 ? (
                    <>
                        {rooms.map(room => (
                            <RoomRow key={room.id} room={room} searchQuery={searchQuery} />
                        ))}
                        {/* Shown only when search yields no results across all rooms */}
                        {searchQuery.trim() && (
                            <div className="p-8 text-center text-stripe-text-secondary">
                                <Search className="mx-auto mb-2 size-8 opacity-30" />
                                <p className="text-sm">No students found matching <span className="font-medium text-stripe-text-primary">"{searchQuery}"</span></p>
                                <button
                                    className="mt-2 text-xs text-stripe-purple hover:underline"
                                    onClick={() => setSearchQuery("")}
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-8 text-center text-stripe-text-secondary">
                        {selectedPropertyId
                            ? "No rooms found for this property."
                            : "Select a property to view rooms."}
                    </div>
                )}
            </div>
        </div>
    );
}
