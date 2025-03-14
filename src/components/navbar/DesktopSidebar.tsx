
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
      className="h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="flex items-center h-16 px-4 bg-sidebar-accent border-b">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-[#0EA5E9] flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">FS</span>
            </div>
            <h1 className="text-xl font-bold text-white">FinSuite</h1>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} pathname={location.pathname} onClick={() => {}} />
            ))}
          </SidebarMenu>
          
          <SidebarSeparator className="my-4" />
          
          <SidebarMenu>
            <NavItem item={fileUploadItem} pathname={location.pathname} onClick={() => {}} />
            <NavItem item={settingsNavItem} pathname={location.pathname} onClick={() => {}} />
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="flex-shrink-0 border-t border-sidebar-border p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-sidebar-foreground">Administrator</p>
                <p className="text-xs text-sidebar-foreground/70">CEO Account</p>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default DesktopSidebar;
