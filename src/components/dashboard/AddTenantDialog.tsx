import { useState, useMemo } from "react";
import { Plus, Loader2, Search, UserCheck, UserPlus, X } from "lucide-react";
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
import { cn } from "../../lib/utils";
import type { Tenant } from "../../types";

interface AddTenantDialogProps {
    roomId: string | number;
}

const AVATAR_COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
];

function avatarColor(id: string) {
    const n = parseInt(id, 10) || id.charCodeAt(0);
    return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export function AddTenantDialog({ roomId }: AddTenantDialogProps) {
    const { selectedPropertyId } = useAppStore();

    // Fetch ALL property tenants so we can find unassigned ones
    const { tenants: allTenants, addTenant, isAddingTenant, updateTenantAsync, isUpdatingTenant } =
        useTenants(selectedPropertyId || undefined);

    const unassignedTenants = useMemo(
        () => allTenants.filter((t) => !t.room_id),
        [allTenants]
    );

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<"assign" | "new">("assign");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [assignError, setAssignError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        FirstName: "",
        LastName: "",
        PhoneNumber: "",
        Password: "Password!234",
    });

    const filteredUnassigned = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return unassignedTenants;
        return unassignedTenants.filter(
            (t) =>
                `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) ||
                (t.whatsapp_number ?? "").includes(q)
        );
    }, [unassignedTenants, searchQuery]);

    const handleOpen = (val: boolean) => {
        setOpen(val);
        if (!val) {
            // reset state on close
            setSearchQuery("");
            setSelectedTenant(null);
            setAssignError(null);
            setFormData({ FirstName: "", LastName: "", PhoneNumber: "", Password: "Password!234" });
        }
        // Default to "assign" tab if unassigned tenants exist, else "new"
        if (val) {
            setTab(unassignedTenants.length > 0 ? "assign" : "new");
        }
    };

    const handleAssign = async () => {
        if (!selectedTenant) return;
        setAssignError(null);
        try {
            await updateTenantAsync({
                tenantId: selectedTenant.id,
                payload: {
                    RoomId: Number(roomId),
                    WhatsappNumber: selectedTenant.whatsapp_number ?? undefined,
                },
            });
            setOpen(false);
        } catch {
            setAssignError("Failed to assign tenant. Please try again.");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPropertyId) return;
        try {
            await addTenant({ propertyId: selectedPropertyId, RoomId: Number(roomId), ...formData });
            setOpen(false);
        } catch (error) {
            console.error("Failed to register tenant:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                    <Plus className="size-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle>Add Tenant to Room</DialogTitle>
                    <DialogDescription>
                        Assign an existing unassigned student or register a new one.
                    </DialogDescription>
                </DialogHeader>

                {/* Tab switcher */}
                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
                    <button
                        type="button"
                        onClick={() => setTab("assign")}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            tab === "assign"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <UserCheck className="size-3.5" />
                        Assign existing
                        {unassignedTenants.length > 0 && (
                            <span className={cn(
                                "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                tab === "assign" ? "bg-stripe-purple/10 text-stripe-purple" : "bg-gray-200 text-gray-500"
                            )}>
                                {unassignedTenants.length}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("new")}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            tab === "new"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <UserPlus className="size-3.5" />
                        Register new
                    </button>
                </div>

                {/* ── Assign existing tab ── */}
                {tab === "assign" && (
                    <div className="flex flex-col gap-3">
                        {unassignedTenants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-center text-gray-400">
                                <UserCheck className="mb-2 size-8 opacity-30" />
                                <p className="text-sm">No unassigned students</p>
                                <button
                                    type="button"
                                    className="mt-2 text-xs text-stripe-purple hover:underline"
                                    onClick={() => setTab("new")}
                                >
                                    Register a new tenant instead
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Search */}
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name or phone…"
                                        className="h-9 w-full rounded-md border border-gray-200 bg-white pl-8 pr-8 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-stripe-purple/30 focus:border-stripe-purple/50"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Tenant list */}
                                <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200">
                                    {filteredUnassigned.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-gray-400">
                                            No results for "{searchQuery}"
                                        </div>
                                    ) : (
                                        filteredUnassigned.map((tenant) => {
                                            const initials = `${tenant.first_name[0] ?? ""}${tenant.last_name[0] ?? ""}`.toUpperCase();
                                            const isSelected = selectedTenant?.id === tenant.id;
                                            return (
                                                <button
                                                    key={tenant.id}
                                                    type="button"
                                                    onClick={() => setSelectedTenant(isSelected ? null : tenant)}
                                                    className={cn(
                                                        "flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition-colors last:border-0",
                                                        isSelected
                                                            ? "bg-stripe-purple/5 ring-1 ring-inset ring-stripe-purple/20"
                                                            : "hover:bg-gray-50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                                        avatarColor(tenant.id)
                                                    )}>
                                                        {initials}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate text-sm font-medium text-gray-900">
                                                            {tenant.first_name} {tenant.last_name}
                                                        </p>
                                                        <p className="truncate text-[11px] text-gray-400">
                                                            {tenant.whatsapp_number || "—"}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="shrink-0 flex size-5 items-center justify-center rounded-full bg-stripe-purple text-white">
                                                            <svg className="size-3" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                {assignError && (
                                    <p className="text-xs text-red-600">{assignError}</p>
                                )}
                            </>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                disabled={!selectedTenant || isUpdatingTenant}
                                onClick={handleAssign}
                                className="w-full sm:w-auto"
                            >
                                {isUpdatingTenant && <Loader2 className="mr-2 size-4 animate-spin" />}
                                {selectedTenant
                                    ? `Assign ${selectedTenant.first_name} to room`
                                    : "Select a student"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* ── Register new tab ── */}
                {tab === "new" && (
                    <form onSubmit={handleRegister}>
                        <div className="grid gap-4 py-2">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="firstName" className="text-right text-sm">
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    value={formData.FirstName}
                                    onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="lastName" className="text-right text-sm">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    value={formData.LastName}
                                    onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right text-sm">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    value={formData.PhoneNumber}
                                    onChange={(e) => setFormData({ ...formData, PhoneNumber: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right text-sm">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.Password}
                                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-2">
                            <Button type="submit" disabled={isAddingTenant}>
                                {isAddingTenant && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Register
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
