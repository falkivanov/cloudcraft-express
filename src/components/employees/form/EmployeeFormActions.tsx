
import React from "react";
import { Button } from "@/components/ui/button";

interface EmployeeFormActionsProps {
  onCancel: () => void;
}

const EmployeeFormActions: React.FC<EmployeeFormActionsProps> = ({ onCancel }) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Abbrechen
      </Button>
      <Button type="submit">Speichern</Button>
    </div>
  );
};

export default EmployeeFormActions;
