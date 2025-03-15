
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useSidebar } from "@/components/ui/sidebar";

const Layout = () => {
  const { open } = useSidebar();
  
  console.log("Layout rendering with sidebar state:", open);
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Navbar />
      <div 
        className={`flex-1 transition-all duration-200 ${
          open ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        <main className="p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
