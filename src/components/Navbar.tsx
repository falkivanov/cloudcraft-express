
import React from "react";
import DesktopSidebar from "./navbar/DesktopSidebar";
import MobileSidebar from "./navbar/MobileSidebar";

const Navbar = () => {
  console.log("Navbar component rendering - DEBUG");
  
  return (
    <>
      {/* Desktop Sidebar - explicitly position it */}
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
