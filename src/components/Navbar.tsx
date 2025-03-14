
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DesktopSidebar from "./navbar/DesktopSidebar";
import MobileSidebar from "./navbar/MobileSidebar";

const Navbar = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <DesktopSidebar />
        </div>

        {/* Mobile Menu */}
        <MobileSidebar />
      </div>
    </SidebarProvider>
  );
};

export default Navbar;
