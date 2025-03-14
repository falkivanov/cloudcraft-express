
import React from "react";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

const SidebarToggle = () => {
  const { open, toggleSidebar } = useSidebar();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleSidebar}
      className="text-sidebar-foreground"
    >
      {open ? <PanelLeftIcon className="h-5 w-5" /> : <PanelRightIcon className="h-5 w-5" />}
    </Button>
  );
};

export default SidebarToggle;
