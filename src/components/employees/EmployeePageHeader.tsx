
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCcw } from "lucide-react";

interface EmployeePageHeaderProps {
  onAddEmployeeClick: () => void;
  onResetEmployees?: () => void;
}

const EmployeePageHeader: React.FC<EmployeePageHeaderProps> = ({ 
  onAddEmployeeClick,
  onResetEmployees
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Mitarbeiter</h1>
      <div className="flex gap-2">
        {onResetEmployees && (
          <Button variant="outline" onClick={onResetEmployees}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Zurücksetzen
          </Button>
        )}
        <Button onClick={onAddEmployeeClick}>
          <UserPlus className="mr-2" />
          Neuer Mitarbeiter
        </Button>
      </div>
    </div>
  );
};

export default EmployeePageHeader;
