
import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Aktiv" | "In Werkstatt" | "Defleet";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  let className = "";
  let indicatorClass = "";
  
  switch (status) {
    case "Aktiv":
      indicatorClass = "bg-green-500";
      break;
    case "In Werkstatt":
      indicatorClass = "bg-orange-500";
      break;
    case "Defleet":
      indicatorClass = "bg-red-500";
      break;
    default:
      indicatorClass = "bg-gray-300";
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div className={cn("w-3 h-3 rounded-sm", indicatorClass)} />
      <span>{status}</span>
    </div>
  );
};

export default StatusBadge;
