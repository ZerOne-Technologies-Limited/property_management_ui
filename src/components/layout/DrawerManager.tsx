import { useAppStore } from "../../lib/store";
import { X } from "lucide-react";
import { Button } from "../ui/button";

// Placeholder drawer content components
function RoomDrawerContent({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold">{data.name}</h3>
                <p className="text-sm text-gray-500">Room Details</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm">Max Capacity: {data.maximum_capacity}</p>
                <p className="text-sm">Notes: {data.notes}</p>
            </div>
        </div>
    )
}

function TenantDrawerContent({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold">{data.first_name} {data.last_name}</h3>
                <p className="text-sm text-gray-500">Tenant Profile</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm">Phone: {data.whatsapp_number}</p>
            </div>
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
