import { useState } from "react";
import type { Room } from "../../types";
import { TenantRow } from "./TenantRow";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ChevronRight, ChevronDown, Edit } from "lucide-react";
import { mockTenants } from "../../data/mock";
import { useAppStore } from "../../lib/store";

interface RoomRowProps {
    room: Room;
}

export function RoomRow({ room }: RoomRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { openDrawer } = useAppStore();

    const loadTenants = () => {
        setIsExpanded(!isExpanded);
    }

    // Filter mock tenants
    const tenants = mockTenants.filter(t => t.room_id === room.id);
    const occupiedCount = tenants.length;
    const occupancyPercentage = (occupiedCount / room.maximum_capacity) * 100;

    return (
        <div className="border-b border-gray-100 last:border-0">
            <div
                className={`group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-blue-50/30 ${isExpanded ? 'bg-blue-50/30' : 'bg-white'}`}
                onClick={loadTenants}
            >
                <div className="grid flex-1 grid-cols-12 gap-4 items-center">
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
                    <div className="col-span-2 text-sm font-medium text-gray-900">
                        $1,200
                    </div>

                    {/* Balance */}
                    <div className="col-span-2 text-sm text-red-600 font-medium">
                        -$200
                    </div>
                </div>

                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => openDrawer('ROOM', room)}>
                        <Edit className="size-4 text-gray-500" />
                    </Button>
                    <Button size="sm" onClick={() => openDrawer('ROOM', room)}>Details</Button>
                </div>
            </div>

            {isExpanded && (
                <div className="bg-gray-50 animate-in slide-in-from-left-2 duration-300">
                    {tenants.map(tenant => (
                        <TenantRow key={tenant.id} tenant={tenant} />
                    ))}
                    {tenants.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-500">No tenants assigned to this room.</div>
                    )}

                    {/* Room Summary Bar */}
                    <div className="flex items-center justify-between bg-gray-100 px-12 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <span>Expected Monthly: $2,400</span>
                        <span>Occupancy: {Math.round(occupancyPercentage)}%</span>
                        <span className="text-red-500">Total Arrears: $200</span>
                    </div>
                </div>
            )}
        </div>
    );
}
