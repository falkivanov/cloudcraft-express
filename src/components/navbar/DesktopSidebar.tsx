
import React, { useEffect } from "react";
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
  const { open, setOpen } = useSidebar();
  
  // Force sidebar to be open on mount
  useEffect(() => {
    console.log("DesktopSidebar mounted, forcing sidebar open");
    setOpen(true);
  }, [setOpen]);
  
  console.log("DesktopSidebar rendering, sidebar state:", open);
  
  return (
    <div className="h-full">
      <Sidebar>
        <SidebarHeader className="flex items-center h-16 px-4 bg-sidebar-accent border-b">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-[#0EA5E9] flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">FS</span>
            </div>
            <h1 className="text-xl font-bold text-white">FinSuite</h1>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="p-2">
          <SidebarMenu className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} pathname={location.pathname} onClick={() => {}} />
            ))}
          </SidebarMenu>
          
          <SidebarSeparator className="my-3" />
          
          <SidebarMenu className="space-y-1">
            <NavItem item={fileUploadItem} pathname={location.pathname} onClick={() => {}} />
            <NavItem item={settingsNavItem} pathname={location.pathname} onClick={() => {}} />
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="w-full block">
            <div className="flex items-center">
              <div>
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
