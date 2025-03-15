
import React from "react";
import { Badge } from "@/components/ui/badge";

interface EmployeeStatusBadgeProps {
  endDate: string | null;
}

const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ endDate }) => {
  if (endDate === null) {
    return <Badge className="bg-green-500">Aktiv</Badge>;
  } else {
    return <Badge className="bg-gray-500">Inaktiv</Badge>;
  }
};

export default EmployeeStatusBadge;
