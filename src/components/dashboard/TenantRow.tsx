import { useState } from "react";
import type { Tenant } from "../../types";
import { PaymentRow } from "./PaymentRow";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ChevronRight, ChevronDown, User, MessageCircle } from "lucide-react";
import { mockTransactions } from "../../data/mock";
import { useAppStore } from "../../lib/store";

interface TenantRowProps {
    tenant: Tenant;
}

export function TenantRow({ tenant }: TenantRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { openDrawer } = useAppStore();

    const loadPayments = () => {
        // Check if we need to load payments. For now we filter mock data.
        setIsExpanded(!isExpanded);
    }

    // Filter mock payments for this tenant
    const payments = mockTransactions.filter(t => t.tenant_id === tenant.id);

    return (
        <div>
            <div
                className={`group flex cursor-pointer items-center justify-between border-t border-gray-100 py-4 pl-12 pr-4 transition-colors hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : 'bg-white'}`}
                onClick={loadPayments}
            >
                <div className="grid flex-1 grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
                            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <User className="size-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{tenant.first_name} {tenant.last_name}</p>
                                <p className="text-xs text-gray-500">{tenant.whatsapp_number}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <Badge variant="success" className="bg-green-100 text-green-700">Up to Date</Badge>
                    </div>

                    <div className="col-span-2 text-sm text-gray-600">
                        $500 Paid
                    </div>

                    <div className="col-span-2 text-sm text-gray-600">
                        $0 Due
                    </div>

                    {/* Progress Bar placeholder */}
                    <div className="col-span-2">
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                            <div className="h-1.5 w-full rounded-full bg-green-500"></div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                    {tenant.whatsapp_number && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50">
                            <MessageCircle className="size-4" />
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openDrawer('TENANT', tenant)}>View Profile</Button>
                </div>
            </div>

            {isExpanded && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                    {payments.length === 0 ? (
                        <div className="py-4 pl-20 italic text-gray-400 text-sm">No payments recorded.</div>
                    ) : (
                        payments.map(payment => (
                            <PaymentRow key={payment.id} payment={payment} />
                        ))
                    )}

                    {/* Tenant Summary Bar */}
                    <div className="flex items-center justify-between bg-blue-50/50 py-2 pl-20 pr-8 text-xs font-medium text-blue-900">
                        <span>Total Contract: $3000</span>
                        <span>Paid: $1500 (50%)</span>
                        <span>Balance: $1500</span>
                    </div>
                </div>
            )}
        </div>
    );
}
