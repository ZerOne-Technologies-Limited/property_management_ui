import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
// import { KPIStrip } from "./KPIStrip";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen w-full flex-col bg-gray-50 text-gray-900 overflow-hidden">
            <TopBar />

            <main className="flex-1 overflow-auto p-6 scrollbar-hide">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* <KPIStrip /> */}
                    {/* Main Content (Grid) */}
                    <div className="min-h-[500px] w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {children}
                    </div>
                </div>
            </main>

            {/* Right Drawer Manager (Component will be placed here) */}
        </div>
    );
}
