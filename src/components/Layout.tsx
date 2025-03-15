
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useSidebar } from "@/components/ui/sidebar";

const Layout = () => {
  const { open, setOpen } = useSidebar();
  
  // Ensure sidebar is open on mount
  useEffect(() => {
    setOpen(true);
    console.log("Layout mounted, sidebar opened:", open);
  }, [setOpen]);
  
  return (
    <div className="flex min-h-screen w-full">
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
