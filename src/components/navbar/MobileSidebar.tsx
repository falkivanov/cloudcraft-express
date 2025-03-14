
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarMenu, SidebarSeparator } from "@/components/ui/sidebar";
import { navigationItems } from "./navigationItems";
import NavItem from "./NavItem";

const MobileSidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mainNavItems, fileUploadItem, settingsNavItem } = navigationItems;
  
  return (
    <div className="md:hidden flex items-center justify-between h-20 px-5 border-b bg-sidebar">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-[#0EA5E9] flex items-center justify-center mr-3">
          <span className="text-white font-bold text-base">FS</span>
        </div>
        <h1 className="text-2xl font-bold text-white">FinSuite</h1>
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <MenuIcon className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <div className="flex items-center h-20 flex-shrink-0 px-5 bg-sidebar-accent border-b">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-[#0EA5E9] flex items-center justify-center mr-3">
                <span className="text-white font-bold text-base">FS</span>
              </div>
              <h1 className="text-2xl font-bold text-white">FinSuite</h1>
            </div>
          </div>
          <div className="mt-5 px-4 space-y-2">
            <SidebarMenu className="space-y-2">
              {mainNavItems.map((item) => (
                <NavItem 
                  key={item.path} 
                  item={item} 
                  pathname={location.pathname} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                />
              ))}
            </SidebarMenu>
            
            <SidebarSeparator className="my-5" />
            
            <SidebarMenu className="space-y-2">
              <NavItem 
                item={fileUploadItem} 
                pathname={location.pathname} 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
              <NavItem 
                item={settingsNavItem} 
                pathname={location.pathname} 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
            </SidebarMenu>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
