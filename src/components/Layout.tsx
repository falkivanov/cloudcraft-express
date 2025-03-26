
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useSidebar } from "@/components/ui/sidebar";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

const Layout = () => {
  const { open } = useSidebar();
  
  return (
    <div className="flex h-screen bg-background">
      <Navbar />
      <div className="flex flex-col flex-1 w-full pl-16 md:pl-16 relative">
        {/* Beta badge */}
        <div className="absolute top-3 right-3 z-50">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold">
            BETA
          </Badge>
        </div>
        
        <main className="flex-1 overflow-y-auto bg-background w-full">
          <div className="py-6 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
