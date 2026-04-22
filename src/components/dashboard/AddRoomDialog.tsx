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
import { useRooms } from "../../hooks/useRooms";
import { useAppStore } from "../../lib/store";

export function AddRoomDialog({ label = 'Room' }: { label?: string }) {
    const { selectedPropertyId } = useAppStore();
    const { addRoom, isAddingRoom } = useRooms(selectedPropertyId || "");
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        RoomName: "",
        RoomCapacity: 1,
        Area: 0,
        Notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPropertyId) return;

        try {
            await addRoom({
                ...formData,
                RoomCapacity: Number(formData.RoomCapacity),
                Area: Number(formData.Area),
            });
            setOpen(false);
            setFormData({
                RoomName: "",
                RoomCapacity: 1,
                Area: 0,
                Notes: "",
            });
        } catch (error) {
            console.error("Failed to create room:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-3 m-2" disabled={!selectedPropertyId}>
                    <Plus className="size-4" />
                    Add {label}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New {label}</DialogTitle>
                    <DialogDescription>
                        Create a new {label.toLowerCase()} in the selected property.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.RoomName}
                                onChange={(e) =>
                                    setFormData({ ...formData, RoomName: e.target.value })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="capacity" className="text-right">
                                Capacity
                            </Label>
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                value={formData.RoomCapacity}
                                onChange={(e) =>
                                    setFormData({ ...formData, RoomCapacity: parseInt(e.target.value) })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="area" className="text-right">
                                Area (sqm)
                            </Label>
                            <Input
                                id="area"
                                type="number"
                                min="0"
                                value={formData.Area}
                                onChange={(e) =>
                                    setFormData({ ...formData, Area: parseInt(e.target.value) })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">
                                Notes
                            </Label>
                            <Input
                                id="notes"
                                value={formData.Notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, Notes: e.target.value })
                                }
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isAddingRoom}>
                            {isAddingRoom && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Add {label}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
