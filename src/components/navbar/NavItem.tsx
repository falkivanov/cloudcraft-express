
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
      >
        <Link to={item.path} onClick={onClick}>
          {item.icon}
          <span>{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default NavItem;
