import { Card, CardContent } from "../ui/card";
import { Users, BedDouble } from "lucide-react";

const kpiData = [
    { label: "Total Rooms", value: "24", sub: "Capacity 48", icon: BedDouble, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Occupied", value: "18", sub: "75% Full", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    // { label: "Monthly Revenue", value: "$12,400", sub: "+8% vs last", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    // { label: "Outstanding", value: "$1,250", sub: "3 tenants late", icon: Wallet, color: "text-red-500", bg: "bg-red-50" },
];

export function KPIStrip() {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpiData.map((kpi, idx) => (
                <Card key={idx} className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardContent className="flex items-center p-4">
                        <div className={`mr-4 flex size-12 items-center justify-center rounded-lg ${kpi.bg}`}>
                            <kpi.icon className={`size-6 ${kpi.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                            </div>
                            <p className="text-xs text-gray-500">{kpi.sub}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
