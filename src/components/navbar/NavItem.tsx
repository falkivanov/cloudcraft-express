
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { qualitySubItems } from "./navigationItems";

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
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const isQualityItem = item.path === "/quality";
  const isActive = pathname === item.path || 
                  (isQualityItem && pathname.includes("/quality"));
  
  const hasActiveSubItem = isQualityItem && 
    qualitySubItems.some(subItem => pathname.includes(subItem.path));

  const handleClick = () => {
    if (isQualityItem) {
      setSubMenuOpen(prev => !prev);
    } else {
      onClick();
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.name}
        className="text-base py-3" // Increased text size and padding
      >
        <div className="flex items-center w-full">
          <Link 
            to={isQualityItem ? "#" : item.path} 
            onClick={isQualityItem ? (e) => { e.preventDefault(); handleClick(); } : onClick} 
            className="flex items-center flex-1"
          >
            <span className="scale-125 mr-1">
              {item.icon}
            </span>
            <span className="font-medium">{item.name}</span>
          </Link>
          
          {isQualityItem && (
            <button onClick={() => setSubMenuOpen(prev => !prev)} className="ml-2">
              {subMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </SidebarMenuButton>
      
      {isQualityItem && subMenuOpen && (
        <SidebarMenuSub>
          {qualitySubItems.map((subItem) => (
            <SidebarMenuSubItem key={subItem.path}>
              <SidebarMenuSubButton
                asChild
                isActive={pathname.includes(subItem.path)}
              >
                <Link to={subItem.path} onClick={onClick} className="flex items-center gap-2">
                  <span className="scale-110">{subItem.icon}</span>
                  <span>{subItem.name}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};

export default NavItem;
