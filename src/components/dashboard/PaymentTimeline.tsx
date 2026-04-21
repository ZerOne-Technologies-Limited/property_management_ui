import { useMemo } from "react";
import type { Transaction } from "../../types";
import { useAppStore } from "../../lib/store";
import { cn } from "../../lib/utils";

interface PaymentTimelineProps {
    payments: Transaction[];
    tenantId: string;
    showTotal?: boolean;
    maxItems?: number;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function PaymentTimeline({ payments, tenantId: _tenantId, showTotal: _showTotal, maxItems = 2 }: PaymentTimelineProps) {
    const { openDrawer } = useAppStore();

    const sorted = useMemo(
        () => [...payments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [payments]
    );

    if (sorted.length === 0) {
        return <span className="text-[10px] italic text-gray-300">No payments</span>;
    }

    const visible  = sorted.slice(0, maxItems);
    const overflow = sorted.length - maxItems;

    return (
        <div className="flex items-center gap-1">
            {visible.map(p => {
                const mon = MONTHS[new Date(p.created_at).getMonth()];
                return (
                    <button
                        key={p.id}
                        type="button"
                        onClick={e => { e.stopPropagation(); openDrawer("PAYMENT", p); }}
                        title={`${mon} · K${p.amount.toLocaleString()}`}
                        className={cn(
                            "inline-flex h-7 items-center rounded-md border border-gray-200 bg-gray-50 px-2.5",
                            "transition-colors hover:border-stripe-purple/40 hover:bg-stripe-purple-light",
                            "focus:outline-none focus:ring-2 focus:ring-stripe-purple/30"
                        )}
                    >
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">{mon}</span>
                        <span className="mx-1 text-gray-200">·</span>
                        <span className="font-mono text-xs font-semibold text-gray-700">{p.amount.toLocaleString()}</span>
                    </button>
                );
            })}

            {overflow > 0 && (
                <span className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-gray-50 px-2 font-mono text-[10px] font-semibold text-gray-400">
                    +{overflow}
                </span>
            )}
        </div>
    );
}
