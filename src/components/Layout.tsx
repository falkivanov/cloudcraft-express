
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useSidebar } from "@/components/ui/sidebar";

const Layout = () => {
  const { open } = useSidebar();
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Navbar />
      <div 
        className={`flex-1 transition-all duration-200 overflow-auto ${
          open ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
