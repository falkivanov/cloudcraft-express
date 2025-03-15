
import React from "react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface NavItemProps {
  item: {
    name: string;
    path: string;
    icon: React.ReactNode;
  };
  pathname: string;
  onClick: () => void;
}

const NavItem = ({ item, pathname, onClick }: NavItemProps) => {
  console.log("NavItem rendering", item.name, "isActive:", pathname === item.path);
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={pathname === item.path}
        tooltip={item.name}
        className="text-base py-3"
      >
        <Link to={item.path} onClick={onClick} className="flex items-center">
          <span className="scale-125 mr-2">
            {item.icon}
          </span>
          <span className="font-medium">{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default NavItem;
