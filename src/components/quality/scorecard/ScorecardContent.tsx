
import React, { useState } from "react";
import { BarChart, UsersRound, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScorecardTimeFrame from "./ScorecardTimeFrame";
import CompanyKPIs from "./CompanyKPIs";
import DriverKPIs from "./DriverKPIs";
import { ScoreCardData } from "./types";
import NoDataMessage from "../NoDataMessage";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import StatCard from "@/components/employees/dashboard/StatCard";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/dateUtils";

interface ScorecardContentProps {
  scorecardData: ScoreCardData | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({ scorecardData }) => {
  // Scorecard specific states
  const [scorecardTab, setScorecardTab] = useState<string>("company");
  const [driverStatusTab, setDriverStatusTab] = useState<string>("active");
  const [timeframe, setTimeframe] = useState<string>("week");
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  
  // Generate available weeks (last 10 weeks)
  const currentDate = new Date();
  const availableWeeks = Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    const weekNum = Math.ceil((((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7);
    return {
      id: i === 0 ? "current" : `week-${weekNum}-${date.getFullYear()}`,
      label: i === 0 ? `KW ${weekNum} (aktuell)` : `KW ${weekNum}`,
      weekNum,
      year: date.getFullYear(),
      date
    };
  });
  
  // Dummy data based on the PDF content
  const dummyData: ScoreCardData = {
    week: 10,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 75.01,
    overallStatus: "Great",
    rank: 6,
    companyKPIs: [
      { name: "Vehicle Audit (VSA)", value: 97.92, target: 98, unit: "%", trend: "up", status: "great" },
      { name: "Safe Driving (FICO)", value: 795, target: 800, unit: "", trend: "up", status: "great" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate", value: 8, target: 10, unit: "", trend: "down", status: "fantastic" },
      { name: "Delivery Completion Rate (DCR)", value: 98.32, target: 99, unit: "%", trend: "up", status: "fair" },
      { name: "Delivered Not Received (DNR DPMO)", value: 1939, target: 1100, unit: "", trend: "down", status: "poor" },
      { name: "Photo On Delivery", value: 98.35, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 91.61, target: 98, unit: "%", trend: "up", status: "fair" },
    ],
    driverKPIs: [
      { 
        name: "A10PTFSFT1G664", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1057, target: 0, unit: "" },
          { name: "DCR", value: 98.88, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 2838, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 99.54, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 89.36, target: 98, unit: "%", status: "poor" }
        ]
      },
      { 
        name: "A13INOOSIM0DQP", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 995, target: 0, unit: "" },
          { name: "DCR", value: 99.8, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 2010, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.77, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 50, target: 98, unit: "%", status: "poor" }
        ]
      },
      { 
        name: "A152NJUHX8M2KZ", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 740, target: 0, unit: "" },
          { name: "DCR", value: 97.24, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 4054, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.84, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 9.09, target: 98, unit: "%", status: "poor" }
        ]
      }
    ],
    recommendedFocusAreas: [
      "Delivered Not Received (DNR DPMO)",
      "Delivery Completion Rate (DCR)",
      "Contact Compliance"
    ]
  };
  
  // Use dummy data if no real data is provided
  const data = scorecardData || dummyData;

  if (!data) {
    return <NoDataMessage category="Scorecard" />;
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex flex-col space-y-6">
        {/* Header with tabs and week selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Tabs for company/driver KPIs */}
          <div className="flex-1">
            <Tabs value={scorecardTab} onValueChange={setScorecardTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Firmen KPIs
                </TabsTrigger>
                <TabsTrigger value="driver" className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4" />
                  Fahrer KPIs
                </TabsTrigger>
              </TabsList>
            
              {/* Time frame selector */}
              <ScorecardTimeFrame timeframe={timeframe} setTimeframe={setTimeframe} />
              
              {/* Header with summary information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <StatCard 
                  title="Overall Score" 
                  value={`${data.overallScore} | ${data.overallStatus}`} 
                  icon={BarChart}
                  description={`Woche ${data.week} - ${data.year}, ${data.location}`}
                  colorClass="bg-green-100 text-green-800"
                />
                <StatCard 
                  title="Rank at DSU1" 
                  value={`${data.rank}`} 
                  icon={BarChart}
                  colorClass="bg-blue-100 text-blue-800"
                />
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Recommended Focus Areas</h3>
                  <ul className="list-disc list-inside text-sm">
                    {data.recommendedFocusAreas.map((area, index) => (
                      <li key={index} className="text-muted-foreground">{area}</li>
                    ))}
                  </ul>
                </Card>
              </div>
              
              {/* Content sections moved below */}
              <TabsContent value="company" className="w-full">
                <CompanyKPIs companyKPIs={data.companyKPIs} />
              </TabsContent>
              
              <TabsContent value="driver" className="w-full">
                <DriverKPIs 
                  driverKPIs={data.driverKPIs}
                  driverStatusTab={driverStatusTab}
                  setDriverStatusTab={setDriverStatusTab}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Week selector dropdown */}
          <div className="flex items-center">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Woche auswählen" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {availableWeeks.map((week) => (
                  <SelectItem key={week.id} value={week.id}>
                    {week.label} ({formatDate(week.date.toISOString())})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorecardContent;
