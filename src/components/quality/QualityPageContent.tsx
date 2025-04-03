
import React from "react";
import { ScoreCardData } from "./scorecard/types";
import CustomerContactContent from "./customer-contact/CustomerContactContent";
import ConcessionsContent from "./ConcessionsContent";
import ScorecardContent from "./scorecard/ScorecardContent";
import MentorContent from "./MentorContent";
import { MentorReport } from "../file-upload/processors/mentor/types";

interface QualityPageContentProps {
  pathname: string;
  dataLoaded: boolean;
  scorecardData: ScoreCardData | null;
  prevWeekScoreCardData: ScoreCardData | null;
  customerContactData: string | null;
  driversData: any[];
  concessionsData: any;
  mentorData: MentorReport | null;
}

const QualityPageContent: React.FC<QualityPageContentProps> = ({
  pathname,
  dataLoaded,
  scorecardData,
  prevWeekScoreCardData,
  customerContactData,
  driversData,
  concessionsData,
  mentorData
}) => {
  if (!dataLoaded) {
    return (
      <div className="p-4 border rounded-lg bg-background flex items-center justify-center h-96">
        <p className="text-muted-foreground">Daten werden geladen...</p>
      </div>
    );
  }

  if (pathname.includes("/quality/scorecard")) {
    return <ScorecardContent scorecardData={scorecardData} prevWeekData={prevWeekScoreCardData} />;
  } else if (pathname.includes("/quality/customer-contact")) {
    return (
      <CustomerContactContent 
        customerContactData={customerContactData} 
        driversData={driversData} 
      />
    );
  } else if (pathname.includes("/quality/concessions")) {
    return <ConcessionsContent concessionsData={concessionsData} />;
  } else if (pathname.includes("/quality/mentor")) {
    return <MentorContent mentorData={mentorData} />;
  }
  
  return (
    <div className="p-4 border rounded-lg bg-background">
      <h2 className="text-2xl font-bold mb-4">Qualitätsmanagement</h2>
      <p>Wählen Sie eine Kategorie in der Seitenleiste aus.</p>
    </div>
  );
};

export default QualityPageContent;
