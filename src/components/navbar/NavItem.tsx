
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
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={pathname === item.path}
        tooltip={item.name}
        className="text-base py-3" // Increased text size and padding
      >
        <Link to={item.path} onClick={onClick} className="flex items-center">
          <span className="scale-125 mr-1">
            {item.icon}
          </span>
          <span className="font-medium">{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default NavItem;
