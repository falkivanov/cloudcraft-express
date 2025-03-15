
import React from "react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar";
import { navigationItems } from "./navigationItems";
import NavItem from "./NavItem";

const DesktopSidebar = () => {
  const location = useLocation();
  const { mainNavItems, fileUploadItem, settingsNavItem } = navigationItems;
  const { setOpen } = useSidebar();
  
  // Hover-Funktion für die Sidebar
  const handleMouseEnter = () => {
    setOpen(true);
  };
  
  const handleMouseLeave = () => {
    setOpen(false);
  };
  
  return (
    <div 
      className="h-full fixed left-0 top-0 z-40"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="flex items-center h-20 px-5 bg-sidebar-accent border-b">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-[#0EA5E9] flex items-center justify-center mr-3">
              <span className="text-white font-bold text-base">FS</span>
            </div>
            <h1 className="text-2xl font-bold text-white">FinSuite</h1>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="p-2">
          <SidebarMenu className="space-y-2">
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} pathname={location.pathname} onClick={() => {}} />
            ))}
          </SidebarMenu>
          
          <SidebarSeparator className="my-5" />
          
          <SidebarMenu className="space-y-2">
            <NavItem item={fileUploadItem} pathname={location.pathname} onClick={() => {}} />
            <NavItem item={settingsNavItem} pathname={location.pathname} onClick={() => {}} />
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="flex-shrink-0 border-t border-sidebar-border p-5">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-base font-medium text-sidebar-foreground">Administrator</p>
                <p className="text-sm text-sidebar-foreground/70">CEO Account</p>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default DesktopSidebar;
