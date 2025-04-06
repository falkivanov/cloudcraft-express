
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { parseWeekIdentifier } from "../data/utils/weekIdentifier";

export interface UnavailableWeekMessageProps {
  weekIdentifier: string;
}

const UnavailableWeekMessage: React.FC<UnavailableWeekMessageProps> = ({ weekIdentifier }) => {
  const parsedWeek = parseWeekIdentifier(weekIdentifier);
  const weekLabel = parsedWeek 
    ? `KW${parsedWeek.weekNum}/${parsedWeek.year}`
    : "ausgewählte Woche";
    
  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-yellow-50 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium">Keine Daten verfügbar</h3>
          <p className="text-muted-foreground max-w-sm">
            Für {weekLabel} sind keine Scorecard-Daten verfügbar.
            Bitte wählen Sie eine andere Woche oder laden Sie neue Daten hoch.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnavailableWeekMessage;
