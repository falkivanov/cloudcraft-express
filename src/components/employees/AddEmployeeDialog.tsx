
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Employee } from "@/types/employee";
import EmployeeForm from "./EmployeeForm";

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEmployee: (employee: Employee) => void;
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  open,
  onOpenChange,
  onAddEmployee
}) => {
  // Default empty employee template with minimal required fields
  const emptyEmployee: Employee = {
    id: crypto.randomUUID(),
    name: "",
    email: "",
    phone: "",
    status: "Aktiv", // Providing a default value
    transporterId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
    address: "",
    telegramUsername: "",
    workingDaysAWeek: 5,
    preferredVehicle: "",
    preferredWorkingDays: [],
    wantsToWorkSixDays: false,
    isWorkingDaysFlexible: true
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuer Mitarbeiter</DialogTitle>
          <DialogDescription>
            Fügen Sie einen neuen Mitarbeiter hinzu
          </DialogDescription>
        </DialogHeader>
        
        <EmployeeForm
          employee={emptyEmployee}
          onSubmit={onAddEmployee}
          onCancel={() => onOpenChange(false)}
          isNewEmployee={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
