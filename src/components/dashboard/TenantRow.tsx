import type { Tenant } from "../../types";
import { PaymentTimeline } from "./PaymentTimeline";
import { Button } from "../ui/button";
import { User, MessageCircle } from "lucide-react";
import { mockTransactions } from "../../data/mock";
import { useAppStore } from "../../lib/store";

interface TenantRowProps {
    tenant: Tenant;
}

export function TenantRow({ tenant }: TenantRowProps) {
    const { openDrawer } = useAppStore();

    // Filter mock payments for this tenant
    const payments = mockTransactions.filter(t => t.tenant_id === tenant.id);

    return (
        <div
            className="group flex items-center justify-between border-t border-gray-100 py-3 pl-12 pr-4 transition-colors hover:bg-gray-50"
        >
            <div className="grid flex-1 grid-cols-12 gap-4 items-center">
                {/* 1. Tenant Info (Cols 1-4) */}
                <div className="col-span-4 flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <User className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 leading-tight">{tenant.first_name} {tenant.last_name}</span>
                            <span className="text-[10px] text-gray-500">{tenant.whatsapp_number}</span>
                        </div>
                    </div>
                    {tenant.whatsapp_number && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:bg-green-50 rounded-full">
                            <MessageCircle className="size-3" />
                        </Button>
                    )}
                </div>

                {/* 2. Inline Payment Timeline (Cols 5-9) */}
                <div className="col-span-5 flex justify-start items-center">
                    <PaymentTimeline payments={payments} tenantId={tenant.id} />
                </div>

                {/* 3. Actions (Cols 10-12) */}
                <div className="col-span-3 text-right flex justify-end gap-2 items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7"
                        onClick={() => openDrawer('PAYMENT_HISTORY', { tenantId: tenant.id, payments })}
                    >
                        View Payments
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openDrawer('TENANT', tenant)}>
                        Profile
                    </Button>
                </div>
            </div>
        </div>
    );
}
