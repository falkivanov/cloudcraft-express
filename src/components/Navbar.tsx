
import React from "react";
import DesktopSidebar from "./navbar/DesktopSidebar";
import MobileSidebar from "./navbar/MobileSidebar";

const Navbar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 z-40 h-screen">
        <DesktopSidebar />
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <MobileSidebar />
      </div>
    </>
  );
};

export default Navbar;
