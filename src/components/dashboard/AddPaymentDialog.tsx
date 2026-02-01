import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useTransactions } from "../../hooks/useTransactions";

interface AddPaymentDialogProps {
    tenantId: string | number;
    roomId: string | number;
    propertyId: string | number;
}

export function AddPaymentDialog({ tenantId, roomId, propertyId }: AddPaymentDialogProps) {
    const { addTransaction, isAddingTransaction } = useTransactions(String(propertyId));
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState<number | string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        try {
            await addTransaction({
                Amount: Number(amount),
                RoomId: Number(roomId),
                PropertyId: Number(propertyId),
                TenantId: Number(tenantId),
            });
            setOpen(false);
            setAmount("");
        } catch (error) {
            console.error("Failed to add payment:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 px-2 gap-1"
                >
                    <Plus className="size-3" />
                    Add Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Payment</DialogTitle>
                    <DialogDescription>
                        Record a new payment transaction for this tenant.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isAddingTransaction || !amount}>
                            {isAddingTransaction && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Save Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
