import type { Transaction } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FileText, RotateCcw } from "lucide-react";
import { useAppStore } from "../../lib/store";
import { useFormatMoney } from "../../lib/format-money";

interface PaymentRowProps {
    payment: Transaction;
}

export function PaymentRow({ payment }: PaymentRowProps) {
    const { openDrawer } = useAppStore();
    const fmt = useFormatMoney();

    return (
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 py-3 pl-20 pr-4 text-sm hover:bg-gray-100">
            <div className="grid flex-1 grid-cols-12 gap-4">
                <div className="col-span-2 text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</div>
                <div className="col-span-2 font-medium text-gray-900">{fmt(payment.amount)}</div>
                <div className="col-span-2">
                    <Badge variant="outline" className="bg-white text-gray-600 border-gray-200">
                        Cash
                    </Badge>
                </div>
                <div className="col-span-3 text-gray-500 truncate">{payment.notes}</div>
                <div className="col-span-2 text-xs text-gray-400 font-mono">{payment.id}</div>
            </div>

            <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6" title="View Receipt" onClick={() => openDrawer('PAYMENT', payment)}>
                    <FileText className="size-3.5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" title="Refund">
                    <RotateCcw className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
