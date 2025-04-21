
import React from "react";
import ScorecardTargetFormUI from "./ScorecardTargetFormUI";
import { useToast } from "@/hooks/use-toast";
import { useScorecardTargetForm } from "./useScorecardTargetForm";

export type TargetItem = {
  name: string;
  value: number;
  unit: string;
};
export type FormValues = {
  targets: TargetItem[];
  validFrom?: string; // Ein globales Datumsfeld
};

interface ScorecardTargetFormProps {
  onSubmit: (data: FormValues) => void;
}

const ScorecardTargetForm: React.FC<ScorecardTargetFormProps> = ({ onSubmit }) => {
  const STORAGE_KEY = "scorecard_custom_targets";
  const { toast } = useToast();
  const {
    form,
    isEditing,
    setIsEditing,
    findTargetIndex,
    accordionValue,
    setAccordionValue,
  } = useScorecardTargetForm(STORAGE_KEY);

  const handleSubmit = (formData: FormValues) => {
    try {
      onSubmit({ targets: formData.targets, validFrom: formData.validFrom });
      setIsEditing(false);
    } catch (e) {
      toast({
        title: "Fehler",
        description: "Ein Fehler ist beim Speichern aufgetreten.",
        variant: "destructive"
      });
    }
  };

  return (
    <ScorecardTargetFormUI
      form={form}
      isEditing={isEditing}
      onSubmit={handleSubmit}
      findTargetIndex={findTargetIndex}
      setIsEditing={setIsEditing}
      accordionValue={accordionValue}
      setAccordionValue={setAccordionValue}
    />
  );
};

export default ScorecardTargetForm;
