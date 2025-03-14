
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex h-screen bg-background">
      <Navbar />
      <div className="md:pl-64 flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
