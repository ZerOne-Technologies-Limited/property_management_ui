import { useAppStore } from "../../lib/store";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { Transaction } from "../../types";
import { useTenants } from "../../hooks/useTenants";
import { useRooms } from "../../hooks/useRooms";
import { useState } from "react";

// Placeholder drawer content components
function RoomDrawerContent({ data }: { data: any }) {
    const { updateRoom, isUpdatingRoom } = useRooms(data?.property_id);
    const { tenants } = useTenants(data?.property_id, data?.id);
    const { closeDrawer } = useAppStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: data?.name || '',
        capacity: data?.maximum_capacity || 0,
        area: data?.area || 0,
        notes: data?.notes || ''
    });
    const [capacityError, setCapacityError] = useState('');

    if (!data) return null;

    const currentOccupants = tenants.length;

    const handleCapacityChange = (newCapacity: number) => {
        setFormData({ ...formData, capacity: newCapacity });
        if (newCapacity < currentOccupants) {
            setCapacityError(`Capacity cannot be less than current occupants (${currentOccupants})`);
        } else {
            setCapacityError('');
        }
    };

    const handleSave = () => {
        // Validate capacity
        if (formData.capacity < currentOccupants) {
            setCapacityError(`Capacity cannot be less than current occupants (${currentOccupants})`);
            return;
        }

        const payload: any = {};
        if (formData.name !== data.name) {
            payload.RoomName = formData.name;
        }
        if (formData.capacity !== data.maximum_capacity) {
            payload.RoomCapacity = formData.capacity;
        }
        if (formData.area !== data.area) {
            payload.Area = formData.area;
        }
        if (formData.notes !== data.notes) {
            payload.Notes = formData.notes;
        }

        if (Object.keys(payload).length > 0) {
            updateRoom({ roomId: data.id, payload }, {
                onSuccess: () => {
                    setIsEditing(false);
                    setCapacityError('');
                    // Close drawer to show updated data when reopened
                    closeDrawer();
                }
            });
        } else {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: data.name,
            capacity: data.maximum_capacity,
            area: data.area,
            notes: data.notes || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold">{data.name}</h3>
                <p className="text-sm text-gray-500">Room Details</p>
            </div>

            {!isEditing ? (
                <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">Capacity:</span> {data.maximum_capacity}</p>
                    <p className="text-sm"><span className="font-medium">Area:</span> {data.area} m²</p>
                    <p className="text-sm"><span className="font-medium">Notes:</span> {data.notes || 'None'}</p>
                    <Button onClick={() => setIsEditing(true)} className="mt-4 w-full">Edit Details</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="roomName">Room Name</Label>
                        <Input
                            id="roomName"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Room 1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                            id="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => handleCapacityChange(parseInt(e.target.value) || 0)}
                            placeholder="2"
                            min={currentOccupants}
                            className={capacityError ? 'border-red-500' : ''}
                        />
                        {capacityError && (
                            <p className="text-sm text-red-600">{capacityError}</p>
                        )}
                        <p className="text-xs text-gray-500">Current occupants: {currentOccupants}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="area">Area (m²)</Label>
                        <Input
                            id="area"
                            type="number"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                            placeholder="20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Optional notes"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleCancel} variant="outline" className="flex-1" disabled={isUpdatingRoom}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="flex-1" disabled={isUpdatingRoom || !!capacityError}>
                            {isUpdatingRoom ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}


function TenantDrawerContent({ data }: { data: any }) {
    const { updateTenant, isUpdatingTenant } = useTenants();
    const { rooms } = useRooms(data?.property_id);
    const { closeDrawer } = useAppStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        roomId: data?.room_id || '',
        whatsappNumber: data?.whatsapp_number || ''
    });

    if (!data) return null;

    const handleSave = () => {
        const payload: any = {};
        if (formData.roomId !== data.room_id) {
            payload.RoomId = parseInt(formData.roomId);
        }
        if (formData.whatsappNumber !== data.whatsapp_number) {
            payload.WhatsappNumber = formData.whatsappNumber;
        }

        if (Object.keys(payload).length > 0) {
            updateTenant({ tenantId: data.id, payload }, {
                onSuccess: () => {
                    setIsEditing(false);
                    // Close drawer to show updated data when reopened
                    closeDrawer();
                }
            });
        } else {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            roomId: data.room_id,
            whatsappNumber: data.whatsapp_number || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold">{data.first_name} {data.last_name}</h3>
                <p className="text-sm text-gray-500">Tenant Profile</p>
            </div>

            {!isEditing ? (
                <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">Room:</span> {rooms.find(r => r.id === data.room_id)?.name || data.room_id}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {data.whatsapp_number || 'Not set'}</p>
                    <Button onClick={() => setIsEditing(true)} className="mt-4 w-full">Edit Details</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="room">Room</Label>
                        <select
                            id="room"
                            value={formData.roomId}
                            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.whatsappNumber}
                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                            placeholder="0700000000"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleCancel} variant="outline" className="flex-1" disabled={isUpdatingTenant}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="flex-1" disabled={isUpdatingTenant}>
                            {isUpdatingTenant ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function PaymentDrawerContent({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold">Transaction {data.id}</h3>
                <p className="text-sm text-gray-500">Payment Details</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm">Amount: ${data.amount}</p>
                <p className="text-sm">Note: {data.notes}</p>
            </div>
        </div>
    )
}

function PaymentHistoryDrawerContent({ data }: { data: { tenantId: string, payments: Transaction[] } }) {
    if (!data || !data.payments) return null;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold">Payment History</h3>
                <p className="text-sm text-gray-500">Full Record ({data.payments.length})</p>
            </div>

            <div className="space-y-2">
                {data.payments.map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                        <div>
                            <p className="font-semibold text-sm">${p.amount}</p>
                            <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                            {p.id}
                        </div>
                    </div>
                ))}
            </div>

            <Button className="w-full">Export CSV</Button>
        </div>
    )
}

export function DrawerManager() {
    const { activeDrawer, closeDrawer } = useAppStore();

    const isOpen = activeDrawer.type !== 'NONE';

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={closeDrawer}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {activeDrawer.type === 'ROOM' && 'Room Details'}
                            {activeDrawer.type === 'TENANT' && 'Tenant Profile'}
                            {activeDrawer.type === 'PAYMENT' && 'Payment Info'}
                            {activeDrawer.type === 'PAYMENT_HISTORY' && 'History'}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={closeDrawer}>
                            <X className="size-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeDrawer.type === 'ROOM' && <RoomDrawerContent data={activeDrawer.dataOrId} />}
                        {activeDrawer.type === 'TENANT' && <TenantDrawerContent data={activeDrawer.dataOrId} />}
                        {activeDrawer.type === 'PAYMENT' && <PaymentDrawerContent data={activeDrawer.dataOrId} />}
                        {activeDrawer.type === 'PAYMENT_HISTORY' && <PaymentHistoryDrawerContent data={activeDrawer.dataOrId} />}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={closeDrawer}>Close</Button>
                            <Button>Primary Action</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
