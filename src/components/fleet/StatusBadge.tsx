
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Aktiv" | "In Werkstatt" | "Defleet";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  let className = "";
  
  switch (status) {
    case "Aktiv":
      className = "bg-green-100 text-green-800 hover:bg-green-200";
      break;
    case "In Werkstatt":
      className = "bg-orange-100 text-orange-800 hover:bg-orange-200";
      break;
    case "Defleet":
      className = "bg-red-100 text-red-800 hover:bg-red-200";
      break;
    default:
      className = "";
  }

  return (
    <Badge variant="outline" className={cn(className)}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
