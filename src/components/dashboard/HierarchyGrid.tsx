import { RoomRow } from "./RoomRow";
import { useAppStore } from "../../lib/store";
import { useRooms } from "../../hooks/useRooms";
// import { useTenants } from "../../hooks/useTenants";
// import { useTransactions } from "../../hooks/useTransactions";

import { AddRoomDialog } from "./AddRoomDialog";

export function HierarchyGrid() {
    const selectedPropertyId = useAppStore(state => state.selectedPropertyId);

    // Fetch data using hooks
    // If no property selected, we might want to wait or show nothing, 
    // but the hooks handle empty/undefined propertyId gracefully (returning empty or all depending on API)
    // Based on axios implementation: fetchRooms returns [] if no ID. fetchTenants/Transactions return all if no ID.
    const { rooms, loading: loadingRooms } = useRooms(selectedPropertyId || "");
    // const { tenants, loading: loadingTenants } = useTenants(selectedPropertyId || undefined);
    // const { transactions, loading: loadingTransactions } = useTransactions(selectedPropertyId || undefined);

    const isLoading = loadingRooms;

    if (isLoading) {
        return <div className="p-8 text-center text-stripe-text-secondary">Loading data...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-end px-4 py-3">
                <AddRoomDialog />
            </div>

            {/* Header Row - Sticky */}
            <div className="grid grid-cols-8 gap-4 border-b border-stripe-border bg-stripe-sidebar px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">
                <div className="col-span-3 pl-8">Name</div>
                <div className="col-span-2">Capacity</div>
                <div className="col-span-2">Status</div>
                {/* <div className="col-span-2">Revenue</div> */}
                {/* <div className="col-span-2">Balance</div> */}
                <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Rows - Scrollable */}
            <div className="flex flex-col overflow-y-auto flex-1">
                {rooms.length > 0 ? (
                    rooms.map(room => (
                        <RoomRow
                            key={room.id}
                            room={room}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-stripe-text-secondary">
                        {selectedPropertyId ? "No rooms found for this property." : "Select a property to view rooms."}
                    </div>
                )}
            </div>
        </div>
    );
}
