import { Search, Calendar } from "lucide-react";
import { useAppStore } from "../../lib/store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { mockProperties } from "../../data/mock";

export function TopBar() {
    const { selectedPropertyId, setSelectedPropertyId } = useAppStore();

    const selectedProperty = mockProperties.find(p => p.id === selectedPropertyId) || mockProperties[0];

    return (
        <div className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
            {/* Property Selector */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-500">Property:</label>
                <select
                    className="h-9 rounded-md border border-gray-300 bg-transparent px-3 text-sm font-semibold focus:outline-blue-500"
                    value={selectedPropertyId || selectedProperty.id}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                >
                    {mockProperties.map(prop => (
                        <option key={prop.id} value={prop.id}>{prop.name}</option>
                    ))}
                </select>
            </div>

            {/* Date Range Filter (Mock) */}
            <Button variant="outline" size="sm" className="ml-4 gap-2 text-gray-600">
                <Calendar className="size-4" />
                <span>This Month</span>
            </Button>

            <div className="flex-1" />

            {/* Global Search */}
            <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-gray-400" />
                <Input
                    className="pl-9"
                    placeholder="Search Room, Tenant, Phone..."
                />
            </div>

            {/* User Logic would go here */}
            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                MG
            </div>
        </div>
    );
}
