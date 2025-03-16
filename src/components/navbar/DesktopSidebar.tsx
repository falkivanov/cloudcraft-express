
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
  const { setOpen, open } = useSidebar();
  
  // Hover-Funktion für die Sidebar
  const handleMouseEnter = () => {
    setOpen(true);
  };
  
  const handleMouseLeave = () => {
    setOpen(false);
  };
  
  return (
    <div 
      className="h-full absolute left-0 top-0 z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="flex items-center h-16 px-4 bg-sidebar-accent border-b">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-[#0EA5E9] flex items-center justify-center">
              <span className="text-white font-bold text-base">FS</span>
            </div>
            {open && (
              <h1 className="text-xl font-bold text-white ml-3 transition-opacity duration-200">FinSuite</h1>
            )}
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
        
        <SidebarFooter className="flex-shrink-0 border-t border-sidebar-border p-4">
          {open ? (
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-0">
                  <p className="text-base font-medium text-sidebar-foreground">Administrator</p>
                  <p className="text-sm text-sidebar-foreground/70">CEO Account</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                <span className="text-white text-xs">A</span>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default DesktopSidebar;
