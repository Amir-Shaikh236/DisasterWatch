import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import AppSidebar from "@/components/layout/Sidebar";
import { Outlet } from "react-router-dom";
// import Notification from "@/components/layout/Notification";

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen">
            <SidebarProvider>
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <SidebarTrigger className="z-10 relative top-3 left-4 cursor-pointer" />
                    {/* <Notification /> */}
                    <main className="flex-1 overflow-y-auto ">
                        <Outlet />
                    </main>
                </div>
            </SidebarProvider>
        </div>
    );
}