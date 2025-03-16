
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, BarChart, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScorecardTimeFrame from "./ScorecardTimeFrame";
import CompanyKPIs from "./CompanyKPIs";
import DriverKPIs from "./DriverKPIs";
import { ScorecardKPI, DriverKPI } from "./types";

interface ScorecardContentProps {
  scorecardData: any | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({ scorecardData }) => {
  // Scorecard specific states
  const [scorecardTab, setScorecardTab] = useState<string>("company");
  const [driverStatusTab, setDriverStatusTab] = useState<string>("active");
  const [timeframe, setTimeframe] = useState<string>("week");
  
  // Dummy data for now
  const companyKPIs: ScorecardKPI[] = [
    { name: "DPMO", value: 8500, target: 8000, unit: "", trend: "down" },
    { name: "DNR", value: 3.2, target: 2.5, unit: "%", trend: "down" },
    { name: "OTIF", value: 97.8, target: 98.5, unit: "%", trend: "up" },
    { name: "CX Score", value: 85.3, target: 90, unit: "%", trend: "up" }
  ];
  
  const driverKPIs: DriverKPI[] = [
    { 
      name: "Max Mustermann", 
      status: "active",
      metrics: [
        { name: "DPMO", value: 7500, target: 8000 },
        { name: "DNR", value: 2.1, target: 2.5 },
        { name: "OTIF", value: 98.5, target: 98.5 },
        { name: "CX Score", value: 92, target: 90 }
      ]
    },
    { 
      name: "Anna Schmidt", 
      status: "active",
      metrics: [
        { name: "DPMO", value: 9200, target: 8000 },
        { name: "DNR", value: 3.8, target: 2.5 },
        { name: "OTIF", value: 96.3, target: 98.5 },
        { name: "CX Score", value: 83, target: 90 }
      ]
    },
    { 
      name: "Thomas Wagner", 
      status: "former",
      metrics: [
        { name: "DPMO", value: 10500, target: 8000 },
        { name: "DNR", value: 4.5, target: 2.5 },
        { name: "OTIF", value: 94.0, target: 98.5 },
        { name: "CX Score", value: 78, target: 90 }
      ]
    }
  ];

  if (!scorecardData) {
    return renderNoDataMessage("Scorecard");
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex flex-col space-y-4">
        <ScorecardTimeFrame timeframe={timeframe} setTimeframe={setTimeframe} />
        
        <Tabs value={scorecardTab} onValueChange={setScorecardTab} className="w-full">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Firmen KPIs
            </TabsTrigger>
            <TabsTrigger value="driver" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Fahrer KPIs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="company" className="w-full">
            <CompanyKPIs companyKPIs={companyKPIs} />
          </TabsContent>
          
          <TabsContent value="driver" className="w-full">
            <DriverKPIs 
              driverKPIs={driverKPIs}
              driverStatusTab={driverStatusTab}
              setDriverStatusTab={setDriverStatusTab}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper function for "No data" message
const renderNoDataMessage = (category: string) => {
  return (
    <div className="mt-6 p-6 border rounded-lg bg-gray-50 text-center">
      <p className="text-lg font-medium mb-3">Keine {category}-Daten verfügbar</p>
      <p className="text-muted-foreground mb-4">
        Bitte laden Sie zuerst eine Datei hoch, um die Daten hier anzuzeigen.
      </p>
      <Button asChild>
        <Link to="/file-upload" className="flex items-center gap-2">
          <UploadIcon className="h-4 w-4" />
          <span>Zur Upload-Seite</span>
        </Link>
      </Button>
    </div>
  );
};

export default ScorecardContent;
