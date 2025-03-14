
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  UserIcon, 
  TruckIcon, 
  CalendarIcon, 
  BarChart2Icon, 
  DollarSignIcon, 
  HomeIcon,
  MenuIcon,
  SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const mainNavItems = [
  { name: "Dashboard", path: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { name: "Mitarbeiter", path: "/employees", icon: <UserIcon className="h-5 w-5" /> },
  { name: "Fuhrpark", path: "/fleet", icon: <TruckIcon className="h-5 w-5" /> },
  { name: "Schichtplanung", path: "/shifts", icon: <CalendarIcon className="h-5 w-5" /> },
  { name: "Scorecard", path: "/scorecard", icon: <BarChart2Icon className="h-5 w-5" /> },
  { name: "Finanzen", path: "/finance", icon: <DollarSignIcon className="h-5 w-5" /> },
];

const settingsNavItem = { 
  name: "Einstellungen", 
  path: "/settings", 
  icon: <SettingsIcon className="h-5 w-5" /> 
};

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-sidebar border-r">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-sidebar-accent border-b">
            <h1 className="text-xl font-bold text-white">Management System</h1>
          </div>
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-3 space-y-2">
              {mainNavItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors ${
                    location.pathname === item.path 
                      ? "bg-sidebar-accent text-white" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-white"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              
              {/* Separator before Settings */}
              <div className="my-4 border-t border-sidebar-border"></div>
              
              {/* Settings Nav Item */}
              <Link 
                key={settingsNavItem.path} 
                to={settingsNavItem.path}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors ${
                  location.pathname === settingsNavItem.path 
                    ? "bg-sidebar-accent text-white" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-white"
                }`}
              >
                <span className="mr-3">{settingsNavItem.icon}</span>
                {settingsNavItem.name}
              </Link>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-sidebar-border p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-sidebar-foreground">Administrator</p>
                  <p className="text-xs text-sidebar-foreground/70">CEO Account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-sidebar">
        <h1 className="text-xl font-bold text-white">Management System</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-sidebar-accent border-b">
              <h1 className="text-xl font-bold text-white">Management System</h1>
            </div>
            <nav className="mt-5 px-3 space-y-2">
              {mainNavItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors ${
                    location.pathname === item.path 
                      ? "bg-sidebar-accent text-white" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              
              {/* Separator before Settings in mobile menu */}
              <div className="my-4 border-t border-sidebar-border"></div>
              
              {/* Settings Nav Item in mobile menu */}
              <Link 
                key={settingsNavItem.path} 
                to={settingsNavItem.path}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors ${
                  location.pathname === settingsNavItem.path 
                    ? "bg-sidebar-accent text-white" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-3">{settingsNavItem.icon}</span>
                {settingsNavItem.name}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto">
          {/* Main content goes here */}
        </main>
      </div>
    </div>
  );
};

export default Navbar;
