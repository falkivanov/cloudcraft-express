
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ScorecardTargetForm from "./scorecard/ScorecardTargetForm";
import { FormValues } from "./scorecard/ScorecardTargetForm";

const ScorecardSettings: React.FC = () => {
  const { toast } = useToast();
  const STORAGE_KEY = "scorecard_custom_targets";

  // Save targets to localStorage
  const onSubmit = (data: FormValues) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.targets));
      toast({
        title: "Zielwerte gespeichert",
        description: "Die Scorecard-Zielwerte wurden erfolgreich aktualisiert.",
      });
      
      // Trigger a custom event to notify components that use this data
      window.dispatchEvent(new Event('scorecard_targets_updated'));
    } catch (error) {
      console.error("Error saving targets:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Zielwerte konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scorecard Zielwerte</CardTitle>
        <CardDescription>
          Passen Sie die Zielwerte für die Unternehmens-KPIs der Scorecard an
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScorecardTargetForm onSubmit={onSubmit} />
      </CardContent>
    </Card>
  );
};

export default ScorecardSettings;
