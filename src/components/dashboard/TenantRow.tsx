import { useMemo, useState, useRef, useEffect } from "react";
import type { Tenant } from "../../types";
import { PaymentTimeline } from "./PaymentTimeline";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { Button } from "../ui/button";
import { User, MessageCircle, MoreVertical } from "lucide-react";
import { useAppStore } from "../../lib/store";
import { useTransactions } from "../../hooks/useTransactions";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface TenantRowProps {
    tenant: Tenant;
}

export function TenantRow({ tenant }: TenantRowProps) {
    const { openDrawer } = useAppStore();
    const dateFilter = useAppStore(state => state.dateFilter);

    const { transactions: payments, loading } = useTransactions({
        PropertyId: Number(tenant.property_id),
        RoomId: tenant.room_id ? Number(tenant.room_id) : undefined,
        TenantId: Number(tenant.id),
        ...(dateFilter.from ? { FromDate: dateFilter.from } : {}),
        ...(dateFilter.to ? { ToDate: dateFilter.to } : {}),
    });

    const total = useMemo(
        () => payments.reduce((sum, p) => sum + p.amount, 0),
        [payments]
    );

    // Kebab menu state
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    return (
        // Mobile: simplified 3-col grid (name | total | actions)
        // Desktop: full 8-col grid matching room header
        <div className="group items-center border-t border-gray-100 transition-colors hover:bg-gray-50
            grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2.5
            sm:grid-cols-8 sm:gap-4 sm:px-4">

            {/* Name — col-span-3 on desktop */}
            <div className="flex items-center gap-2 min-w-0 pl-6 sm:col-span-3 sm:pl-8">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <User className="size-3.5" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 leading-tight">
                        {tenant.first_name} {tenant.last_name}
                    </p>
                    <p className="truncate text-[10px] text-gray-400">{tenant.whatsapp_number}</p>
                </div>
                {tenant.whatsapp_number && (
                    <a
                        href={`https://wa.me/${tenant.whatsapp_number.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="shrink-0 flex size-6 items-center justify-center rounded-full text-green-600 hover:bg-green-50 transition-colors"
                        title="WhatsApp"
                    >
                        <MessageCircle className="size-3.5" />
                    </a>
                )}
            </div>

            {/* Timeline — hidden on mobile, col-span-2 on desktop */}
            <div className="hidden sm:flex sm:col-span-2 items-center">
                {loading ? (
                    <Loader2 className="size-3.5 animate-spin text-gray-400" />
                ) : (
                    <PaymentTimeline
                        payments={payments}
                        tenantId={tenant.id}
                        showTotal={false}
                        maxItems={2}
                    />
                )}
            </div>

            {/* Total — always visible, col-span-2 on desktop */}
            <div className="sm:col-span-2">
                {loading ? (
                    <span className="text-xs text-gray-300">…</span>
                ) : (
                    <span className={cn(
                        "font-mono text-sm font-semibold tabular-nums",
                        total > 0 ? "text-emerald-700" : "text-gray-400"
                    )}>
                        {total > 0 ? `K${total.toLocaleString()}` : "—"}
                    </span>
                )}
            </div>

            {/* Actions — always visible, col-span-1 on desktop */}
            <div className="flex justify-end items-center gap-1 sm:col-span-1">
                <AddPaymentDialog
                    tenantId={tenant.id}
                    roomId={tenant.room_id || 0}
                    propertyId={tenant.property_id}
                    iconOnly
                />

                {/* More options kebab */}
                <div className="relative" ref={menuRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-gray-600"
                        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                        title="More options"
                    >
                        <MoreVertical className="size-3.5" />
                    </Button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full z-30 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            <button
                                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                    setMenuOpen(false);
                                    openDrawer("PAYMENT_HISTORY", { tenantId: tenant.id, payments });
                                }}
                            >
                                View Payments
                            </button>
                            <button
                                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                    setMenuOpen(false);
                                    openDrawer("TENANT", tenant);
                                }}
                            >
                                Tenant Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
