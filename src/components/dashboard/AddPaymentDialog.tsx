import { useState } from "react";
import { Plus, Loader2, Ban } from "lucide-react";
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
    roomId: string | number | null | undefined;
    propertyId: string | number;
    iconOnly?: boolean;
}

export function AddPaymentDialog({ tenantId, roomId, propertyId, iconOnly = false }: AddPaymentDialogProps) {
    const { addTransaction, isAddingTransaction } = useTransactions({ PropertyId: Number(propertyId) });
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState<number | string>("");

    const hasRoom = roomId != null && Number(roomId) !== 0;

    const handleOpenChange = (val: boolean) => {
        if (val && !hasRoom) return; // block opening when no room
        setOpen(val);
        if (!val) setAmount("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !hasRoom) return;

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

    const disabledTitle = "Assign this tenant to a room before adding a payment";

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {iconOnly ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!hasRoom}
                        className={
                            hasRoom
                                ? "h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                : "h-7 w-7 text-gray-300 cursor-not-allowed"
                        }
                        title={hasRoom ? "Add payment" : disabledTitle}
                    >
                        {hasRoom ? <Plus className="size-3.5" /> : <Ban className="size-3.5" />}
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!hasRoom}
                        title={!hasRoom ? disabledTitle : undefined}
                        className={
                            hasRoom
                                ? "text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 px-2 gap-1"
                                : "text-xs text-gray-300 h-7 px-2 gap-1 cursor-not-allowed"
                        }
                    >
                        <Plus className="size-3" />
                        Add Payment
                    </Button>
                )}
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
