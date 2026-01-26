import { useState, useEffect } from "react";
import type { Transaction } from "../../types";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "../../lib/store";
import { cn } from "../../lib/utils";

interface PaymentTimelineProps {
    payments: Transaction[];
    tenantId: string;
}

export function PaymentTimeline({ payments, tenantId }: PaymentTimelineProps) {
    const { openDrawer } = useAppStore();
    // Sort oldest to newest
    const sortedPayments = [...payments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // We want to show 3 items by default, compact.
    const ITEMS_TO_SHOW = 3;

    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        if (sortedPayments.length > ITEMS_TO_SHOW) {
            setStartIndex(sortedPayments.length - ITEMS_TO_SHOW);
        } else {
            setStartIndex(0);
        }
    }, [sortedPayments.length]);

    const handleLeftClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStartIndex(prev => Math.max(0, prev - 1));
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStartIndex(prev => Math.min(sortedPayments.length - ITEMS_TO_SHOW, prev + 1));
    };

    const handleRowClick = () => {
        openDrawer('PAYMENT_HISTORY', { tenantId, payments: sortedPayments });
    };

    const visiblePayments = sortedPayments.slice(startIndex, startIndex + ITEMS_TO_SHOW);

    const canScrollLeft = startIndex > 0;
    const canScrollRight = startIndex + ITEMS_TO_SHOW < sortedPayments.length;

    if (sortedPayments.length === 0) {
        return (
            <div className="text-[10px] text-gray-300 italic px-2">
                No payments
            </div>
        );
    }

    return (
        <div
            className="flex items-center gap-1 group/timeline cursor-pointer"
            onClick={handleRowClick}
        >
            {/* Left Control */}
            <div className="flex-shrink-0 w-4 flex justify-center">
                {canScrollLeft && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full hover:bg-gray-100 p-0"
                        onClick={handleLeftClick}
                    >
                        <ChevronLeft className="size-3 text-gray-400" />
                    </Button>
                )}
            </div>

            {/* Items Container */}
            <div className="flex items-center justify-center gap-2">
                {visiblePayments.map((payment) => (
                    <div
                        key={payment.id}
                        className="flex items-center gap-1 group/item"
                        onClick={(e) => {
                            e.stopPropagation();
                            openDrawer('PAYMENT', payment);
                        }}
                    >
                        <div
                            className={cn(
                                "px-2 py-1 rounded font-mono font-medium text-xs transition-colors border",
                                "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                            )}
                        >
                            {payment.amount}
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Control */}
            <div className="flex-shrink-0 w-4 flex justify-center">
                {canScrollRight && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full hover:bg-gray-100 p-0"
                        onClick={handleRightClick}
                    >
                        <ChevronRight className="size-3 text-gray-400" />
                    </Button>
                )}
            </div>
        </div>
    );
}
