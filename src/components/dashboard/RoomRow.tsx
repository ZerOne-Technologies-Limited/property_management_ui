import { useState } from "react";
import type { Room } from "../../types";
import { TenantRow } from "./TenantRow";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ChevronRight, ChevronDown, Edit, Loader2 } from "lucide-react";
import { useAppStore } from "../../lib/store";
import { useTenants } from "../../hooks/useTenants";
import { AddTenantDialog } from "./AddTenantDialog";

interface RoomRowProps {
    room: Room;
}

export function RoomRow({ room }: RoomRowProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { openDrawer } = useAppStore();

    // Fetch tenants for this room specifically
    const { tenants, loading } = useTenants(room.property_id, room.id);

    const loadTenants = () => {
        setIsExpanded(!isExpanded);
    }

    // Use passed tenants prop instead of filtering mock data
    const occupiedCount = tenants.length;
    const occupancyPercentage = (occupiedCount / room.maximum_capacity) * 100;

    return (
        <div className="border-b border-gray-100 last:border-0">
            <div
                className={`group grid grid-cols-8 gap-4 cursor-pointer items-center p-4 transition-colors hover:bg-blue-50/30 ${isExpanded ? 'bg-blue-50/30' : 'bg-white'}`}
                onClick={loadTenants}
            >
                {/* Expand & Name */}
                <div className="col-span-3 flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
                        {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </Button>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">{room.name}</h4>
                    </div>
                </div>

                {/* Capacity */}
                <div className="col-span-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">{occupiedCount} / {room.maximum_capacity}</span>
                    <div className="h-1.5 w-16 rounded-full bg-gray-200">
                        <div
                            className={`h-1.5 rounded-full ${occupancyPercentage >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${occupancyPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                    <Badge variant={occupancyPercentage >= 100 ? 'destructive' : occupancyPercentage === 0 ? 'secondary' : 'default'} className={occupancyPercentage === 0 ? 'bg-gray-100 text-gray-600' : ''}>
                        {occupancyPercentage >= 100 ? 'Full' : occupancyPercentage === 0 ? 'Vacant' : 'Partial'}
                    </Badge>
                </div>

                {/* Revenue */}
                {/* <div className="col-span-2">
                    <div className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-sm font-medium text-emerald-700">
                        $1,200
                    </div>
                </div> */}

                {/* Balance */}
                {/* <div className="col-span-2">
                    <div className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-0.5 text-sm font-medium text-red-700">
                        -$200
                    </div>
                </div> */}

                {/* Actions */}
                <div className="col-span-1 flex justify-end">
                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
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
                            {tenants.map(tenant => (
                                <TenantRow
                                    key={tenant.id}
                                    tenant={tenant}
                                />
                            ))}
                            {tenants.length === 0 && (
                                <div className="p-4 text-center text-sm text-gray-500">No tenants assigned to this room.</div>
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
