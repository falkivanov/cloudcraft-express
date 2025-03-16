
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface EmployeePageHeaderProps {
  onAddEmployeeClick: () => void;
}

const EmployeePageHeader: React.FC<EmployeePageHeaderProps> = ({ 
  onAddEmployeeClick 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Mitarbeiter</h1>
      <Button onClick={onAddEmployeeClick}>
        <UserPlus className="mr-2" />
        Neuer Mitarbeiter
      </Button>
    </div>
  );
};

export default EmployeePageHeader;
