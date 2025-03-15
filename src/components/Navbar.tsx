
import React from "react";
import DesktopSidebar from "./navbar/DesktopSidebar";
import MobileSidebar from "./navbar/MobileSidebar";

const Navbar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-40">
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
