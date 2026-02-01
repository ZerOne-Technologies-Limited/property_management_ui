import { useState, useEffect, useMemo } from "react";
import type { Transaction } from "../../types";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "../../lib/store";
import { cn } from "../../lib/utils";

interface PaymentTimelineProps {
    payments: Transaction[];
    tenantId: string;
}

export function PaymentTimeline({ payments, tenantId: _tenantId }: PaymentTimelineProps) {
    const { openDrawer } = useAppStore();
    // Sort oldest to newest
    const sortedPayments = [...payments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // We want to show 3 items by default, compact.
    const ITEMS_TO_SHOW = 3;

    const [startIndex, setStartIndex] = useState(0);
    const [selectedPaymentIds, setSelectedPaymentIds] = useState<Set<string>>(new Set());

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

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, paymentId: string) => {
        e.stopPropagation();
        setSelectedPaymentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(paymentId)) {
                newSet.delete(paymentId);
            } else {
                newSet.add(paymentId);
            }
            return newSet;
        });
    };

    const selectedTotal = useMemo(() => {
        return sortedPayments
            .filter(p => selectedPaymentIds.has(p.id))
            .reduce((sum, p) => sum + p.amount, 0);
    }, [sortedPayments, selectedPaymentIds]);

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
            className="flex items-center gap-1 group/timeline"
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
                        className={cn(
                            "flex items-stretch rounded font-mono font-medium text-xs transition-colors border overflow-hidden",
                            selectedPaymentIds.has(payment.id)
                                ? "bg-blue-50 border-blue-400"
                                : "bg-white border-gray-200 hover:border-blue-300"
                        )}
                    >
                        {/* Checkbox Column */}
                        <div
                            className={cn(
                                "flex items-center justify-center px-1.5 cursor-pointer transition-colors",
                                selectedPaymentIds.has(payment.id)
                                    ? "bg-blue-100"
                                    : "bg-gray-50 hover:bg-gray-100"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                const syntheticEvent = {
                                    stopPropagation: () => { },
                                    target: { checked: !selectedPaymentIds.has(payment.id) }
                                } as React.ChangeEvent<HTMLInputElement>;
                                handleCheckboxChange(syntheticEvent, payment.id);
                            }}
                        >
                            <div
                                className={cn(
                                    "w-3 h-3 rounded-sm border-2 flex items-center justify-center transition-colors",
                                    selectedPaymentIds.has(payment.id)
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-gray-400 bg-white"
                                )}
                            >
                                {selectedPaymentIds.has(payment.id) && (
                                    <div className="w-1.5 h-1.5 bg-white rounded-sm" />
                                )}
                            </div>
                        </div>

                        {/* Payment Info Column */}
                        <div
                            className="flex flex-col items-center justify-center px-2 py-1 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                openDrawer('PAYMENT', payment);
                            }}
                        >
                            <span className={cn(
                                "text-[9px] uppercase leading-none font-bold",
                                selectedPaymentIds.has(payment.id) ? "text-blue-500" : "text-gray-400"
                            )}>
                                {new Date(payment.created_at).toLocaleString('default', { month: 'short' }).toUpperCase()}
                            </span>
                            <span className={cn(
                                selectedPaymentIds.has(payment.id) ? "text-blue-700" : "text-gray-700"
                            )}>{payment.amount}</span>
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

            {/* Total Display */}
            {selectedPaymentIds.size > 0 && (
                <div className="ml-2 px-2 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-700 font-mono font-bold text-xs">
                    Total: {selectedTotal}
                </div>
            )}
        </div>
    );
}
