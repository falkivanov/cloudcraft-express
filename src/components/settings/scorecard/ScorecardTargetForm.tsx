
import React from "react";
import ScorecardTargetFormUI from "./ScorecardTargetFormUI";
import { useToast } from "@/hooks/use-toast";
import { useScorecardTargetForm } from "./useScorecardTargetForm";

export type TargetItem = {
  name: string;
  value: number;
  unit: string;
  effectiveFromWeek?: number;
  effectiveFromYear?: number;
};
export type FormValues = {
  targets: TargetItem[];
};
export type ProcessedTarget = TargetItem;

interface ScorecardTargetFormProps {
  onSubmit: (data: FormValues) => void;
}

const ScorecardTargetForm: React.FC<ScorecardTargetFormProps> = ({ onSubmit }) => {
  const STORAGE_KEY = "scorecard_custom_targets";
  const { toast } = useToast();
  const {
    form,
    showEffectiveDate,
    setShowEffectiveDate,
    isEditing,
    setIsEditing,
    toggleEffectiveDate,
    currentWeek,
    currentYear,
    findTargetIndex,
    accordionValue,
    setAccordionValue,
  } = useScorecardTargetForm(STORAGE_KEY);

  // Handles form submit (process logic as before)
  const handleSubmit = (formData: FormValues) => {
    const processedTargets = formData.targets.map(target => {
      const processedTarget: ProcessedTarget = {
        name: target.name,
        value: target.value,
        unit: target.unit || ""
      };
      if (showEffectiveDate[target.name]) {
        if (target.effectiveFromWeek && target.effectiveFromYear) {
          processedTarget.effectiveFromWeek = target.effectiveFromWeek;
          processedTarget.effectiveFromYear = target.effectiveFromYear;
        }
      }
      return processedTarget;
    });
    try {
      onSubmit({ targets: processedTargets });
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
      showEffectiveDate={showEffectiveDate}
      isEditing={isEditing}
      onSubmit={handleSubmit}
      currentWeek={currentWeek}
      currentYear={currentYear}
      toggleEffectiveDate={toggleEffectiveDate}
      findTargetIndex={findTargetIndex}
      setIsEditing={setIsEditing}
      accordionValue={accordionValue}
      setAccordionValue={setAccordionValue}
    />
  );
};

export default ScorecardTargetForm;

// Note: FormValues, TargetItem, and ProcessedTarget type exports remain for compatibility with other imports
