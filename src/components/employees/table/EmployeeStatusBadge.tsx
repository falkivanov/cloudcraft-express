
import React from "react";
import { Badge } from "@/components/ui/badge";

interface EmployeeStatusBadgeProps {
  endDate: string | null;
}

const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ endDate }) => {
  if (endDate === null) {
    return <Badge className="bg-green-500 hover:bg-green-600">Aktiv</Badge>;
  } else {
    // Calculate days since end date
    const daysSinceEnd = Math.floor(
      (new Date().getTime() - new Date(endDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Recently inactive (less than 30 days) - show in orange
    if (daysSinceEnd < 30) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Kürzlich inaktiv</Badge>;
    }
    
    // Inactive for a longer time
    return <Badge className="bg-gray-500 hover:bg-gray-600">Inaktiv</Badge>;
  }
};

export default EmployeeStatusBadge;
