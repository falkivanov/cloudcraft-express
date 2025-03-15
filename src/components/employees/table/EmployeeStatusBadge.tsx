
import React from "react";
import { Badge } from "@/components/ui/badge";

interface EmployeeStatusBadgeProps {
  status: string;
}

const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "Aktiv":
      return <Badge className="bg-green-500">Aktiv</Badge>;
    case "Urlaub":
      return <Badge className="bg-blue-500">Urlaub</Badge>;
    case "Krank":
      return <Badge className="bg-amber-500">Krank</Badge>;
    case "Inaktiv":
      return <Badge className="bg-gray-500">Inaktiv</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default EmployeeStatusBadge;
