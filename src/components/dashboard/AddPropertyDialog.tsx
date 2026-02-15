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
import { useProperties } from "../../hooks/useProperties";
import { type PropertyType } from "../../types";

export function AddPropertyDialog() {
    const { addProperty, isCreating } = useProperties();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        Name: "",
        PropertyType: "BoardingHouse" as PropertyType,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addProperty(formData.Name, formData.PropertyType);
            setOpen(false);
            setFormData({
                Name: "",
                PropertyType: "BoardingHouse",
            });
        } catch (error) {
            console.error("Failed to create property:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="size-4" />
                    <span>Add Property</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                        Create a new property to manage.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="propertyName" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="propertyName"
                                value={formData.Name}
                                onChange={(e) =>
                                    setFormData({ ...formData, Name: e.target.value })
                                }
                                className="col-span-3"
                                placeholder="Property Name"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="propertyType" className="text-right">
                                Type
                            </Label>
                            <select
                                id="propertyType"
                                value={formData.PropertyType}
                                onChange={(e) =>
                                    setFormData({ ...formData, PropertyType: e.target.value as PropertyType })
                                }
                                className="col-span-3 h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="BoardingHouse">BoardingHouse</option>
                                <option value="Lodge">Lodge</option>
                                <option value="Hotel">Hotel</option>
                                <option value="Hostel">Hostel</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Create Property
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
