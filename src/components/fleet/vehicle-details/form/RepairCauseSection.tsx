
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import EmployeeSelect from "./EmployeeSelect";

interface RepairCauseSectionProps {
  causeType: "Verschleiß" | "Unfall";
  causedByEmployeeId?: string;
  onCauseTypeChange: (value: "Verschleiß" | "Unfall") => void;
  onEmployeeSelect: (employeeId: string) => void;
}

const RepairCauseSection = ({ 
  causeType, 
  causedByEmployeeId, 
  onCauseTypeChange, 
  onEmployeeSelect 
}: RepairCauseSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Ursache</Label>
        <RadioGroup 
          value={causeType}
          onValueChange={(value: "Verschleiß" | "Unfall") => onCauseTypeChange(value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Verschleiß" id="verschleiss" />
            <Label htmlFor="verschleiss">Verschleiß</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Unfall" id="unfall" />
            <Label htmlFor="unfall">Unfall</Label>
          </div>
        </RadioGroup>
      </div>
      
      {causeType === "Unfall" && (
        <EmployeeSelect 
          employeeId={causedByEmployeeId}
          onEmployeeSelect={onEmployeeSelect}
        />
      )}
    </>
  );
};

export default RepairCauseSection;
