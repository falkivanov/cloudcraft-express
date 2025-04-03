
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SortIconProps {
  direction: 'asc' | 'desc';
}

export const SortIcon: React.FC<SortIconProps> = ({ direction }) => {
  return direction === 'asc' ? (
    <ChevronUp className="h-4 w-4 ml-1" />
  ) : (
    <ChevronDown className="h-4 w-4 ml-1" />
  );
};
