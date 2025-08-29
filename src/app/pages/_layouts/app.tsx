import { AppSidebar } from "@/app/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/app/components/ui/sidebar";
import { Outlet } from "react-router";

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="p-4 flex flex-col w-full h-screen">
        <div className="flex relative border-b-1 border-gray-300 pb-1">
          <SidebarTrigger className="z-10" />
          <div className="absolute w-full flex items-center justify-center">
            <img src="/logo.png" alt="logo" style={{ width: 50 }} />
          </div>
        </div>
        <div className="mt-2 flex w-full h-full">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
