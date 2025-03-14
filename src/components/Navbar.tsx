
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  UserIcon, 
  TruckIcon, 
  CalendarIcon, 
  BarChart2Icon, 
  DollarSignIcon, 
  HomeIcon,
  MenuIcon,
  SettingsIcon,
  FileUpIcon,
  PanelLeftIcon,
  PanelRightIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";

const mainNavItems = [
  { name: "Dashboard", path: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { name: "Mitarbeiter", path: "/employees", icon: <UserIcon className="h-5 w-5" /> },
  { name: "Fuhrpark", path: "/fleet", icon: <TruckIcon className="h-5 w-5" /> },
  { name: "Schichtplanung", path: "/shifts", icon: <CalendarIcon className="h-5 w-5" /> },
  { name: "Scorecard", path: "/scorecard", icon: <BarChart2Icon className="h-5 w-5" /> },
  { name: "Finanzen", path: "/finance", icon: <DollarSignIcon className="h-5 w-5" /> },
];

// Moved file upload to be its own item after the separator
const fileUploadItem = { 
  name: "Dateien hochladen", 
  path: "/file-upload", 
  icon: <FileUpIcon className="h-5 w-5" /> 
};

const settingsNavItem = { 
  name: "Einstellungen", 
  path: "/settings", 
  icon: <SettingsIcon className="h-5 w-5" /> 
};

// Custom SidebarToggle component
const SidebarToggle = () => {
  const { open, toggleSidebar } = useSidebar();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleSidebar}
      className="text-sidebar-foreground"
    >
      {open ? <PanelLeftIcon className="h-5 w-5" /> : <PanelRightIcon className="h-5 w-5" />}
    </Button>
  );
};

// Custom NavItem component
const NavItem = ({ item, pathname, onClick }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={pathname === item.path}
        tooltip={item.name}
      >
        <Link to={item.path} onClick={onClick}>
          {item.icon}
          <span>{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const DesktopSidebar = () => {
  const location = useLocation();
  
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex items-center h-16 px-4 bg-sidebar-accent border-b">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-[#0EA5E9] flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">FS</span>
          </div>
          <h1 className="text-xl font-bold text-white">FinSuite</h1>
        </div>
        <div className="ml-auto">
          <SidebarToggle />
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
  );
};

const MobileSidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
