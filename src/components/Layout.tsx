
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useSidebar } from "@/components/ui/sidebar";

const Layout = () => {
  const { open } = useSidebar();
  
  return (
    <div className="flex h-screen w-full bg-background">
      <Navbar />
      <div className="flex flex-col flex-1 w-full pl-16 md:pl-16">
        <main className="flex-1 overflow-y-auto bg-background w-full">
          <div className="py-6 w-full px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
