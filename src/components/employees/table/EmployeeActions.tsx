
import React, { useState } from "react";
import { Employee } from "@/types/employee";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  IdCard,
  UserCheck,
  UserMinus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface EmployeeActionsProps {
  employee: Employee;
  isFormerView: boolean;
  onViewDetails: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onOpenContractEndDialog: (employee: Employee) => void;
  onReactivateEmployee: (employee: Employee) => void;
}

const EmployeeActions: React.FC<EmployeeActionsProps> = ({
  employee,
  isFormerView,
  onViewDetails,
  onEditEmployee,
  onOpenContractEndDialog,
  onReactivateEmployee
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Menü öffnen</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(employee)}>
          <IdCard className="mr-2 h-4 w-4" />
          <span>Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditEmployee(employee)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Bearbeiten</span>
        </DropdownMenuItem>
        {!isFormerView && (
          <DropdownMenuItem onClick={() => onOpenContractEndDialog(employee)}>
            <UserMinus className="mr-2 h-4 w-4" />
            <span>Vertrag beenden</span>
          </DropdownMenuItem>
        )}
        {isFormerView && (
          <DropdownMenuItem onClick={() => onReactivateEmployee(employee)}>
            <UserCheck className="mr-2 h-4 w-4" />
            <span>Reaktivieren</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Löschen</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeActions;
