
import React, { useEffect } from "react";
import { ScoreCardData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScorecardSummary from "./components/ScorecardSummary";
import CompanyKPIs from "./components/CompanyKPIs";
import DriverKPIs from "./components/DriverKPIs";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ScorecardContentProps {
  scorecardData: ScoreCardData | null;
  prevWeekData: ScoreCardData | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({
  scorecardData,
  prevWeekData,
}) => {
  useEffect(() => {
    if (scorecardData?.isSampleData) {
      // Nur einmalig anzeigen
      toast.warning("Beispieldaten werden angezeigt", {
        description: "Die hochgeladene PDF konnte nicht vollständig ausgelesen werden. Es werden teilweise Beispieldaten angezeigt.",
        id: "sample-data-warning",
        duration: 8000,
      });
    }
  }, [scorecardData]);

  if (!scorecardData) {
    return (
      <div className="p-4 border rounded-lg bg-background">
        <h3 className="text-lg font-medium mb-2">Keine Scorecard-Daten gefunden</h3>
        <p className="text-muted-foreground mb-4">
          Bitte laden Sie eine Scorecard-Datei hoch, um die Daten anzuzeigen.
        </p>
        <a
          href="/upload"
          className="text-primary hover:text-primary/80 hover:underline"
        >
          Zur Upload-Seite
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      {scorecardData.isSampleData && (
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Beispieldaten werden angezeigt</AlertTitle>
          <AlertDescription className="text-amber-700">
            Die hochgeladene PDF konnte nicht vollständig ausgelesen werden. 
            Einige oder alle angezeigten Daten sind Beispieldaten und entsprechen nicht Ihrem tatsächlichen Scorecard.
          </AlertDescription>
        </Alert>
      )}
      
      <ScorecardSummary
        scorecardData={scorecardData}
        prevWeekData={prevWeekData}
      />

      <Tabs defaultValue="company" className="mt-6">
        <TabsList>
          <TabsTrigger value="company">Firmen-KPIs</TabsTrigger>
          <TabsTrigger value="driver">Fahrer-KPIs</TabsTrigger>
        </TabsList>
        <TabsContent value="company" className="p-2">
          <CompanyKPIs
            companyKPIs={scorecardData.companyKPIs}
            previousWeekData={prevWeekData}
          />
        </TabsContent>
        <TabsContent value="driver" className="p-2">
          <DriverKPIs
            driverKPIs={scorecardData.driverKPIs}
            previousWeekData={prevWeekData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScorecardContent;
