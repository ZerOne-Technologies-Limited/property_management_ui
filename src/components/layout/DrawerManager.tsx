import { useAppStore } from "../../lib/store";
import { X, Printer, Building2, BedDouble, User, Calendar, FileText, Hash } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { Transaction } from "../../types";
import { useTenants } from "../../hooks/useTenants";
import { useRooms } from "../../hooks/useRooms";
import { useProperties } from "../../hooks/useProperties";
import { useState, useMemo } from "react";
import { cn } from "../../lib/utils";

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
    const { rooms, loading: loadingRooms } = useRooms(data?.property_id || '');
    const { closeDrawer } = useAppStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        roomId: data?.room_id || '',
        whatsappNumber: data?.whatsapp_number || ''
    });

    if (!data) return null;

    console.log('Tenant drawer - property_id:', data.property_id);
    console.log('Tenant drawer - rooms:', rooms);
    console.log('Tenant drawer - loading rooms:', loadingRooms);

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
                        {loadingRooms ? (
                            <div className="text-sm text-gray-500">Loading rooms...</div>
                        ) : rooms.length === 0 ? (
                            <div className="text-sm text-red-600">No rooms available</div>
                        ) : (
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
                        )}
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

// ─── Shared helpers ───────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(iso: string) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,"0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}
function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtK(n: number) {
    return `K${n.toLocaleString()}`;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 border-b border-stripe-border py-2.5 last:border-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-stripe-sidebar">
                <Icon className="size-3.5 text-stripe-text-secondary" />
            </div>
            <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-wider text-stripe-text-secondary">{label}</span>
            <span className="flex-1 truncate text-sm font-medium text-stripe-text-primary">{value || "—"}</span>
        </div>
    );
}

function printSingleReceipt(tx: Transaction, tenant: string, room: string, property: string) {
    const w = window.open("", "_blank", "width=480,height=680");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt #${tx.id}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:36px 40px;color:#111;max-width:420px;margin:0 auto}
.brand{font-size:18px;font-weight:700;color:#635BFF}.tagline{font-size:11px;color:#9ca3af;margin-bottom:24px}
.heading{text-align:center;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:18px}
hr{border:none;border-top:1px dashed #d1d5db;margin:14px 0}.row{display:flex;justify-content:space-between;margin-bottom:8px}
.lbl{font-size:12px;color:#6b7280}.val{font-size:12px;font-weight:500;text-align:right}
.amount-row .lbl{font-size:14px;font-weight:600;color:#111}.amount-row .val{font-size:22px;font-weight:700;color:#059669}
.mono{font-family:monospace;font-size:11px;color:#9ca3af}.footer{margin-top:24px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:12px}
@media print{.btn{display:none}}</style></head><body>
<div class="brand">property.zapps</div><div class="tagline">Official Payment Receipt</div>
<div class="heading">Payment Receipt</div>
<div class="row"><span class="lbl">Receipt No.</span><span class="val mono">#${tx.id}</span></div>
<div class="row"><span class="lbl">Date</span><span class="val">${fmtDate(tx.created_at)} ${fmtTime(tx.created_at)}</span></div>
<hr/><div class="row"><span class="lbl">Tenant</span><span class="val">${tenant}</span></div>
<div class="row"><span class="lbl">Property</span><span class="val">${property}</span></div>
<div class="row"><span class="lbl">Room</span><span class="val">${room}</span></div>
${tx.notes ? `<div class="row"><span class="lbl">Notes</span><span class="val">${tx.notes}</span></div>` : ""}
<hr/><div class="row amount-row"><span class="lbl">Amount Paid</span><span class="val">${fmtK(tx.amount)}</span></div>
<div class="footer">Thank you for your payment · property.zapps</div>
<br/><div style="text-align:center"><button class="btn" onclick="window.print();window.close()" style="padding:8px 20px;background:#635BFF;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">🖨 Print</button></div>
</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch { /**/ } }, 400);
}

// ─── Payment info drawer ──────────────────────────────────────────────────────

function PaymentDrawerContent({ data }: { data: Transaction }) {
    const { properties } = useProperties();
    const { rooms }      = useRooms(data?.property_id || "");
    const { tenants }    = useTenants(data?.property_id, data?.room_id || undefined);

    if (!data) return null;

    const property = properties.find(p => p.id === data.property_id)?.name ?? `#${data.property_id}`;
    const room     = rooms.find(r => r.id === data.room_id)?.name     ?? `#${data.room_id}`;
    const tenant   = useMemo(() => {
        const t = tenants.find(t => t.id === data.tenant_id);
        return t ? `${t.first_name} ${t.last_name}` : `#${data.tenant_id}`;
    }, [tenants, data.tenant_id]);

    return (
        <div className="flex flex-col gap-0">
            {/* Amount hero */}
            <div className="flex items-end justify-between border-b border-stripe-border bg-stripe-sidebar px-6 py-5">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-stripe-text-secondary">Amount Paid</p>
                    <p className="mt-1 font-mono text-3xl font-bold text-emerald-700">{fmtK(data.amount)}</p>
                </div>
                <div className="text-right">
                    <p className="font-mono text-xs text-stripe-text-secondary">#{data.id}</p>
                    <p className="text-xs text-stripe-text-secondary">{fmtDate(data.created_at)}</p>
                    <p className="text-xs text-stripe-text-secondary">{fmtTime(data.created_at)}</p>
                </div>
            </div>

            {/* Details */}
            <div className="px-6 py-2">
                <InfoRow icon={Building2} label="Property" value={property} />
                <InfoRow icon={BedDouble} label="Room"     value={room} />
                <InfoRow icon={User}      label="Tenant"   value={tenant} />
                <InfoRow icon={Calendar}  label="Date"     value={`${fmtDate(data.created_at)} · ${fmtTime(data.created_at)}`} />
                <InfoRow icon={Hash}      label="Ref"      value={`#${data.id}`} />
                {data.notes && <InfoRow icon={FileText} label="Notes" value={data.notes} />}
            </div>

            {/* Actions */}
            <div className="mt-2 border-t border-stripe-border px-6 py-4">
                <button
                    onClick={() => printSingleReceipt(data, tenant, room, property)}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-stripe-border bg-white py-2 text-sm font-medium text-stripe-text-primary hover:bg-stripe-sidebar transition-colors"
                >
                    <Printer className="size-4" /> Print Receipt
                </button>
            </div>
        </div>
    );
}

// ─── Payment history drawer ───────────────────────────────────────────────────

function PaymentHistoryDrawerContent({ data }: { data: { tenantId: string; payments: Transaction[] } }) {
    if (!data?.payments) return null;

    const sorted = useMemo(
        () => [...data.payments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [data.payments]
    );

    const total = useMemo(() => sorted.reduce((s, p) => s + p.amount, 0), [sorted]);
    const { openDrawer } = useAppStore();

    function exportCSV() {
        const rows = sorted.map(p => [fmtDate(p.created_at), fmtTime(p.created_at), p.id, p.amount, `"${(p.notes ?? "").replace(/"/g, '""')}"`]);
        const csv = [["Date","Time","Ref #","Amount","Notes"], ...rows].map(r => r.join(",")).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `payments-${data.tenantId}.csv`;
        a.click();
    }

    return (
        <div className="flex flex-col">
            {/* Summary bar */}
            <div className="flex items-end justify-between border-b border-stripe-border bg-stripe-sidebar px-6 py-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-stripe-text-secondary">Total Collected</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-emerald-700">{fmtK(total)}</p>
                </div>
                <span className="rounded-md border border-stripe-border bg-white px-2.5 py-1 font-mono text-xs font-semibold text-stripe-text-secondary">
                    {sorted.length} payment{sorted.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-stripe-border bg-stripe-sidebar px-6 py-2 text-[10px] font-semibold uppercase tracking-wider text-stripe-text-secondary">
                <span>Date</span>
                <span className="text-right">Ref #</span>
                <span className="text-right">Amount</span>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {sorted.length === 0 ? (
                    <div className="py-12 text-center text-sm text-stripe-text-secondary">No payments recorded.</div>
                ) : sorted.map(p => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => openDrawer("PAYMENT", p)}
                        className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-stripe-sidebar"
                    >
                        {/* Date + notes */}
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-stripe-text-primary">{fmtDate(p.created_at)}</p>
                            <p className="text-[11px] text-stripe-text-secondary">{fmtTime(p.created_at)}{p.notes ? ` · ${p.notes}` : ""}</p>
                        </div>

                        {/* Ref */}
                        <span className="font-mono text-xs text-stripe-text-secondary">#{p.id}</span>

                        {/* Amount pill */}
                        <span className={cn(
                            "inline-flex h-7 items-center rounded-md border px-2.5 font-mono text-xs font-semibold tabular-nums",
                            "border-emerald-200 bg-emerald-50 text-emerald-700"
                        )}>
                            {fmtK(p.amount)}
                        </span>
                    </button>
                ))}
            </div>

            {/* Footer */}
            {sorted.length > 0 && (
                <div className="border-t border-stripe-border px-6 py-4">
                    <button
                        onClick={exportCSV}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-stripe-border bg-white py-2 text-sm font-medium text-stripe-text-primary hover:bg-stripe-sidebar transition-colors"
                    >
                        Export CSV
                    </button>
                </div>
            )}
        </div>
    );
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
                    <div className={cn(
                        "flex-1 overflow-y-auto",
                        (activeDrawer.type === 'PAYMENT' || activeDrawer.type === 'PAYMENT_HISTORY') ? "" : "p-6"
                    )}>
                        {activeDrawer.type === 'ROOM' && <RoomDrawerContent data={activeDrawer.dataOrId} />}
                        {activeDrawer.type === 'TENANT' && <TenantDrawerContent data={activeDrawer.dataOrId} />}
                        {activeDrawer.type === 'PAYMENT' && <PaymentDrawerContent data={activeDrawer.dataOrId} />}
                        {activeDrawer.type === 'PAYMENT_HISTORY' && <PaymentHistoryDrawerContent data={activeDrawer.dataOrId} />}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={closeDrawer}>Close</Button>
                            {/* <Button>Primary Action</Button> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
