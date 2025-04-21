import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ScorecardTargetForm from "./scorecard/ScorecardTargetForm";
import DriverKpiTargetForm from "./scorecard/DriverKpiTargetForm";
import { FormValues } from "./scorecard/ScorecardTargetForm";
import ScorecardTargetHistorySheet from "./scorecard/ScorecardTargetHistorySheet";

const ScorecardSettings: React.FC = () => {
  const { toast } = useToast();
  const STORAGE_KEY = "scorecard_custom_targets";

  // Save targets to localStorage (Company KPI)
  const onSubmit = (data: FormValues) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.targets));
      toast({
        title: "Zielwerte gespeichert",
        description: "Die Scorecard-Zielwerte wurden erfolgreich aktualisiert.",
      });
      
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Scorecard Zielwerte</CardTitle>
          <CardDescription>
            Passen Sie die Zielwerte für die Unternehmens-KPIs der Scorecard an
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScorecardTargetForm onSubmit={onSubmit} />
          <ScorecardTargetHistorySheet />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Fahrer KPI Zielwerte</CardTitle>
          <CardDescription>
            Passen Sie die Zielwerte für KPIs von Fahrern an (zweifach für Score und Farbgebung)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DriverKpiTargetForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScorecardSettings;
