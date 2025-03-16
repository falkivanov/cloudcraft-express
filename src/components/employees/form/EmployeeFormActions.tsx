
import React from "react";
import { Button } from "@/components/ui/button";

interface EmployeeFormActionsProps {
  onCancel: () => void;
  submitLabel?: string;
}

const EmployeeFormActions: React.FC<EmployeeFormActionsProps> = ({ 
  onCancel,
  submitLabel = "Speichern"
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Abbrechen
      </Button>
      <Button type="submit">{submitLabel}</Button>
    </div>
  );
};

export default EmployeeFormActions;
