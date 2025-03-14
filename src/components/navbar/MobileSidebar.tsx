
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
    <div className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-sidebar">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-[#0EA5E9] flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">FS</span>
        </div>
        <h1 className="text-xl font-bold text-white">FinSuite</h1>
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-sidebar-accent border-b">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-[#0EA5E9] flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <h1 className="text-xl font-bold text-white">FinSuite</h1>
            </div>
          </div>
          <div className="mt-5 px-3 space-y-1">
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem 
                  key={item.path} 
                  item={item} 
                  pathname={location.pathname} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                />
              ))}
            </SidebarMenu>
            
            <SidebarSeparator className="my-4" />
            
            <SidebarMenu>
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
