import { useState, useEffect, useMemo } from "react";
import type { Room } from "../../types";
import { TenantRow } from "./TenantRow";
import { Button } from "../ui/button";
import { ChevronRight, ChevronDown, Edit, Loader2 } from "lucide-react";
import { useAppStore } from "../../lib/store";
import { useTenants } from "../../hooks/useTenants";
import { AddTenantDialog } from "./AddTenantDialog";

interface RoomRowProps {
    room: Room;
    searchQuery?: string;
    label?: string;
}

export function RoomRow({ room, searchQuery = "", label = "Room" }: RoomRowProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { openDrawer } = useAppStore();

    const { tenants, loading } = useTenants(room.property_id, room.id);

    const isSearching = searchQuery.trim().length > 0;

    // Auto-expand when a search is active
    useEffect(() => {
        if (isSearching) setIsExpanded(true);
    }, [isSearching]);

    // Filter tenants by name when searching
    const displayedTenants = useMemo(() => {
        if (!isSearching) return tenants;
        const q = searchQuery.trim().toLowerCase();
        return tenants.filter(t =>
            `${t.first_name} ${t.last_name}`.toLowerCase().includes(q)
        );
    }, [tenants, searchQuery, isSearching]);

    // Hide this room entirely when searching and nothing matches (not still loading)
    if (isSearching && !loading && displayedTenants.length === 0) return null;

    const loadTenants = () => {
        if (!isSearching) setIsExpanded(v => !v);
    };

    const occupiedCount = tenants.length;
    const occupancyPercentage = (occupiedCount / room.maximum_capacity) * 100;

    return (
        <div className="border-b border-gray-100 last:border-0">
            <div
                className={`group cursor-pointer items-center transition-colors hover:bg-blue-50/30 ${isExpanded ? 'bg-blue-50/30' : 'bg-white'}
                    grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-3 sm:grid-cols-8 sm:gap-4 sm:px-4`}
                onClick={loadTenants}
            >
                {/* Expand & Name */}
                <div className="flex items-center gap-2 sm:col-span-3">
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-gray-400">
                        {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="truncate text-sm font-bold text-gray-900">{room.name}</h4>
                            {/* Match count badge while searching */}
                            {isSearching && !loading && (
                                <span className="shrink-0 rounded-full bg-stripe-purple px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                                    {displayedTenants.length}
                                </span>
                            )}
                        </div>
                        {/* Occupancy shown inline on mobile */}
                        <p className="text-[10px] text-gray-400 sm:hidden">
                            {occupiedCount}/{room.maximum_capacity} {label.toLowerCase()} occupied
                        </p>
                    </div>
                </div>

                {/* Capacity — desktop only */}
                <div className="hidden sm:col-span-2 sm:flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">{occupiedCount} / {room.maximum_capacity}</span>
                    <div className="h-1.5 w-16 rounded-full bg-gray-200">
                        <div
                            className={`h-1.5 rounded-full ${occupancyPercentage >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${occupancyPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Total — desktop only */}
                <div className="hidden sm:block sm:col-span-2">
                    <span className="text-sm text-gray-300">—</span>
                </div>

                {/* Actions */}
                <div className="flex justify-end sm:col-span-1">
                    <div className="flex gap-1 sm:gap-2 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                        <AddTenantDialog roomId={room.id} />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer('ROOM', room)}>
                            <Edit className="size-4 text-gray-500" />
                        </Button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="bg-gray-50 animate-in slide-in-from-left-2 duration-300">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="size-4 animate-spin text-gray-500" />
                        </div>
                    ) : (
                        <>
                            {displayedTenants.map(tenant => (
                                <TenantRow
                                    key={tenant.id}
                                    tenant={tenant}
                                />
                            ))}
                            {displayedTenants.length === 0 && !isSearching && (
                                <div className="p-4 text-center text-sm text-gray-500">No tenants assigned to this {label.toLowerCase()}.</div>
                            )}
                        </>
                    )}

                    {/* Room Summary Bar */}
                    <div className="flex items-center justify-between bg-gray-100 px-12 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {/* <span>Expected Monthly: $2,400</span> */}
                        <span>Occupancy: {Math.round(occupancyPercentage)}%</span>
                        {/* <span className="text-red-500">Total Arrears: $200</span> */}
                    </div>
                </div>
            )}
        </div>
    );
}
