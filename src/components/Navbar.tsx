
import React from "react";
import DesktopSidebar from "./navbar/DesktopSidebar";
import MobileSidebar from "./navbar/MobileSidebar";

const Navbar = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>

      {/* Mobile Menu */}
      <MobileSidebar />
    </div>
  );
};

export default Navbar;
