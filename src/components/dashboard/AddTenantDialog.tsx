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
import { useTenants } from "../../hooks/useTenants";
import { useAppStore } from "../../lib/store";

interface AddTenantDialogProps {
    roomId: string | number;
}

export function AddTenantDialog({ roomId }: AddTenantDialogProps) {
    const { selectedPropertyId } = useAppStore();
    const { addTenant, isAddingTenant } = useTenants(selectedPropertyId || "", String(roomId));
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        FirstName: "",
        LastName: "",
        PhoneNumber: "",
        Password: "Password!234", // Default from curl example
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPropertyId) return;

        try {
            await addTenant({
                propertyId: selectedPropertyId,
                RoomId: Number(roomId),
                ...formData
            });
            setOpen(false);
            setFormData({
                FirstName: "",
                LastName: "",
                PhoneNumber: "",
                Password: "Password!234",
            });
        } catch (error) {
            console.error("Failed to register tenant:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                    <Plus className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Tenant</DialogTitle>
                    <DialogDescription>
                        Register a new tenant to this room.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                value={formData.FirstName}
                                onChange={(e) =>
                                    setFormData({ ...formData, FirstName: e.target.value })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                value={formData.LastName}
                                onChange={(e) =>
                                    setFormData({ ...formData, LastName: e.target.value })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={formData.PhoneNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, PhoneNumber: e.target.value })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.Password}
                                onChange={(e) =>
                                    setFormData({ ...formData, Password: e.target.value })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isAddingTenant}>
                            {isAddingTenant && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Register
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
