
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useSidebar } from "@/components/ui/sidebar";

const Layout = () => {
  const { setOpen } = useSidebar();
  
  // Force sidebar to be open on mount
  useEffect(() => {
    console.log("Layout mounted - FORCING sidebar open");
    setOpen(true);
  }, [setOpen]);
  
  return (
    <>
      <Navbar />
      <div className="flex-1 md:ml-64">
        <main className="p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Layout;
