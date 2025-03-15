
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface RepairDetailsSectionProps {
  location: string;
  description: string;
  onLocationChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const RepairDetailsSection = ({
  location,
  description,
  onLocationChange,
  onDescriptionChange
}: RepairDetailsSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="repair-location">Werkstatt / Ort</Label>
        <Input 
          id="repair-location" 
          placeholder="Name und Ort der Werkstatt"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="repair-description">Beschreibung</Label>
        <Textarea 
          id="repair-description" 
          placeholder="Beschreiben Sie die durchgeführten Arbeiten"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
};

export default RepairDetailsSection;
