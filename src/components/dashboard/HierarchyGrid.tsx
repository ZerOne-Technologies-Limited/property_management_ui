import { RoomRow } from "./RoomRow";
import { mockRooms } from "../../data/mock";
import { useAppStore } from "../../lib/store";

export function HierarchyGrid() {
    const { selectedPropertyId } = useAppStore();

    // Filter rooms by selected property
    // If no property selected, show all (or first one)
    const filteredRooms = selectedPropertyId
        ? mockRooms.filter(r => r.property_id === selectedPropertyId)
        : mockRooms; // Or just empty initally

    return (
        <div className="flex flex-col">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <div className="col-span-3 pl-8">Name</div>
                <div className="col-span-2">Capacity</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Revenue</div>
                <div className="col-span-2">Balance</div>
                <div className="col-span-1">Action</div>
            </div>

            {/* Rows */}
            <div className="flex flex-col">
                {filteredRooms.length > 0 ? (
                    filteredRooms.map(room => (
                        <RoomRow key={room.id} room={room} />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No rooms found. Select a property.
                    </div>
                )}
            </div>
        </div>
    );
}
