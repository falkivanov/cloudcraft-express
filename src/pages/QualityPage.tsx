
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadIcon, CheckCircle, AlertTriangle, BarChart, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

interface ScorecardKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "neutral";
}

interface DriverKPI {
  name: string;
  status: "active" | "former";
  metrics: {
    name: string;
    value: number;
    target: number;
  }[];
}

const QualityPage = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [customerContactData, setCustomerContactData] = useState<string | null>(null);
  const [scorecardData, setScoreCardData] = useState<any>(null);
  const [podData, setPodData] = useState<any>(null);
  const [concessionsData, setConcessionsData] = useState<any>(null);
  const [driversData, setDriversData] = useState<DriverComplianceData[]>([]);
  
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
  
  // Beim Laden der Komponente und bei Änderung des Pfads
  // die Daten aus dem LocalStorage laden
  useEffect(() => {
    if (pathname.includes("/quality/customer-contact")) {
      const data = localStorage.getItem("customerContactData");
      setCustomerContactData(data);
      
      // Parse HTML to extract driver compliance data
      if (data) {
        parseCustomerContactData(data);
      }
    } else if (pathname.includes("/quality/scorecard")) {
      try {
        const data = localStorage.getItem("scorecardData");
        if (data) {
          setScoreCardData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Error parsing scorecard data:", error);
      }
    } else if (pathname.includes("/quality/pod")) {
      try {
        const data = localStorage.getItem("podData");
        if (data) {
          setPodData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Error parsing POD data:", error);
      }
    } else if (pathname.includes("/quality/concessions")) {
      try {
        const data = localStorage.getItem("concessionsData");
        if (data) {
          setConcessionsData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Error parsing concessions data:", error);
      }
    }
  }, [pathname]);
  
  // Parse customer contact HTML to extract driver data
  const parseCustomerContactData = (htmlContent: string) => {
    try {
      // Create a DOM parser to extract data from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      
      // Find table rows with driver data
      const rows = doc.querySelectorAll("table tr");
      const extractedData: DriverComplianceData[] = [];
      
      // Skip header row, start from index 1
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll("td");
        if (cells.length >= 6) { // Make sure we have enough cells
          const fullName = cells[0].textContent?.trim() || "";
          const nameParts = fullName.split(" ");
          const firstName = nameParts[0] || "";
          const totalAddresses = parseInt(cells[1].textContent?.trim() || "0", 10);
          const totalContacts = parseInt(cells[2].textContent?.trim() || "0", 10);
          const complianceText = cells[5].textContent?.trim() || "0%";
          const compliancePercentage = parseFloat(complianceText.replace("%", ""));
          
          extractedData.push({
            name: fullName,
            firstName,
            totalAddresses,
            totalContacts,
            compliancePercentage
          });
        }
      }
      
      setDriversData(extractedData);
    } catch (error) {
      console.error("Error parsing customer contact HTML:", error);
    }
  };
  
  // Generate personalized message for drivers with compliance below 98%
  const generateDriverMessage = (driver: DriverComplianceData) => {
    return `Hi ${driver.firstName}, letzte Woche musstest du ${driver.totalAddresses} Kunden kontaktiert, hast aber nur ${driver.totalContacts} kontaktiert. Immer wenn du ein Paket nicht zustellen kannst musst du den Kunden anrufen oder eine SMS schreiben. Bitte versuch diese Woche auf 100% zu kommen.`;
  };

  // Style for compliance values
  const getComplianceStyle = (percentage: number) => {
    return percentage < 98 
      ? "bg-red-100 text-red-800 font-semibold"
      : "bg-green-100 text-green-800 font-semibold";
  };
  
  // Get KPI status style 
  const getKPIStatusStyle = (value: number, target: number, trend: "up" | "down" | "neutral") => {
    if (trend === "up") {
      return value >= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    } else if (trend === "down") {
      return value <= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };
  
  // Get driver KPI status style
  const getDriverKPIStyle = (value: number, target: number, metric: string) => {
    if (metric === "DPMO" || metric === "DNR") {
      return value <= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    } else {
      return value >= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    }
  };
  
  // Prepare chart data
  const prepareChartData = (kpis: ScorecardKPI[]) => {
    return kpis.map(kpi => ({
      name: kpi.name,
      value: kpi.value,
      target: kpi.target
    }));
  };
  
  // Filter drivers by status (active or former)
  const filteredDriverKPIs = driverKPIs.filter(driver => 
    driverStatusTab === "active" ? driver.status === "active" : driver.status === "former"
  );
  
  // Render scorecard content
  const renderScorecardContent = () => {
    return (
      <div className="p-4 border rounded-lg bg-background">
        <div className="flex flex-col space-y-4">
          <div className="mb-4">
            <RadioGroup 
              value={timeframe}
              onValueChange={setTimeframe}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="week" id="week" />
                <label htmlFor="week" className="text-sm">Woche</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="month" />
                <label htmlFor="month" className="text-sm">Monat</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarter" id="quarter" />
                <label htmlFor="quarter" className="text-sm">Quartal</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="year" id="year" />
                <label htmlFor="year" className="text-sm">Jahr</label>
              </div>
            </RadioGroup>
          </div>
          
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {companyKPIs.map((kpi, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex justify-between items-center">
                        <span>{kpi.name}</span>
                        <Badge className={getKPIStatusStyle(kpi.value, kpi.target, kpi.trend)}>
                          {kpi.value}{kpi.unit}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="text-sm text-muted-foreground">
                        Ziel: {kpi.target}{kpi.unit}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="h-80 w-full mb-4">
                <ChartContainer config={{}} className="h-full">
                  <RechartsBarChart data={prepareChartData(companyKPIs)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="border border-gray-200 bg-white p-2 shadow-sm rounded-md text-xs">
                              <p className="font-bold">{payload[0].payload.name}</p>
                              <p>Aktuell: {payload[0].value}</p>
                              <p>Ziel: {payload[0].payload.target}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#8884d8" />
                  </RechartsBarChart>
                </ChartContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="driver" className="w-full">
              <div className="w-full">
                <Tabs value={driverStatusTab} onValueChange={setDriverStatusTab} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="active">Aktive Fahrer</TabsTrigger>
                    <TabsTrigger value="former">Ehemalige Fahrer</TabsTrigger>
                  </TabsList>
                  
                  <div className="space-y-6">
                    {filteredDriverKPIs.length > 0 ? (
                      filteredDriverKPIs.map((driver, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{driver.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {driver.metrics.map((metric, metricIndex) => (
                                <div key={metricIndex} className="p-3 border rounded-md">
                                  <div className="text-sm font-medium mb-1">{metric.name}</div>
                                  <div className="flex justify-between items-center">
                                    <Badge className={getDriverKPIStyle(metric.value, metric.target, metric.name)}>
                                      {metric.value}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      Ziel: {metric.target}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center p-8 border rounded-lg bg-gray-50">
                        <p className="text-muted-foreground">Keine Fahrer in dieser Kategorie</p>
                      </div>
                    )}
                  </div>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };
  
  // Determine which quality section to display based on the current path
  const renderContent = () => {
    if (pathname.includes("/quality/scorecard")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Scorecard</h2>
          <p className="mb-4">Hier finden Sie detaillierte Leistungskennzahlen und KPIs.</p>
          
          {scorecardData ? (
            renderScorecardContent()
          ) : (
            renderNoDataMessage("Scorecard")
          )}
        </div>
      );
    } else if (pathname.includes("/quality/customer-contact")) {
      return (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-background">
            <h2 className="text-2xl font-bold mb-4">Customer Contact</h2>
            <p className="mb-4">Kundenkontaktberichte und Kommunikationsanalysen.</p>
            
            {customerContactData ? (
              <div className="mt-6 space-y-6">
                {/* Enhanced display with colored compliance values */}
                <div 
                  className="max-h-[500px] overflow-auto border rounded p-4 bg-slate-50 customer-contact-report"
                  dangerouslySetInnerHTML={{ 
                    __html: customerContactData.replace(
                      /<td>(\d+(\.\d+)?)%<\/td>/g, 
                      (match, percentage) => {
                        const value = parseFloat(percentage);
                        const colorClass = value < 98 ? 'bg-red-100 text-red-800 font-semibold' : 'bg-green-100 text-green-800 font-semibold';
                        return `<td class="${colorClass} px-2 py-1 rounded">${value}%</td>`;
                      }
                    ) 
                  }} 
                />
                
                {/* Display personalized messages for drivers with compliance below 98% */}
                {driversData.filter(driver => driver.compliancePercentage < 98).length > 0 && (
                  <div className="mt-8 border rounded-lg p-4 bg-amber-50">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Personalisierte Nachrichten für Fahrer mit Compliance unter 98%
                    </h3>
                    <div className="space-y-4">
                      {driversData
                        .filter(driver => driver.compliancePercentage < 98)
                        .map((driver, index) => (
                          <div key={index} className="p-3 bg-white rounded-md border">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-semibold">{driver.name}</span>
                              <Badge className={getComplianceStyle(driver.compliancePercentage)}>
                                {driver.compliancePercentage}%
                              </Badge>
                            </div>
                            <p className="text-sm">{generateDriverMessage(driver)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              renderNoDataMessage("Customer Contact")
            )}
          </div>
        </div>
      );
    } else if (pathname.includes("/quality/pod")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">POD (Proof of Delivery)</h2>
          <p className="mb-4">Liefernachweise und Zustellungsdokumentation.</p>
          
          {podData ? (
            <div className="mt-6 p-4 border rounded bg-slate-50">
              <h3 className="text-lg font-semibold mb-2">Geladene POD-Daten</h3>
              <p>Dateiname: {podData.fileName}</p>
              <p>Dateityp: {podData.type.toUpperCase()}</p>
              {/* Hier könnte eine spezifische Darstellung der POD-Daten erfolgen */}
            </div>
          ) : (
            renderNoDataMessage("POD")
          )}
        </div>
      );
    } else if (pathname.includes("/quality/concessions")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Concessions</h2>
          <p className="mb-4">Übersicht zu Zugeständnissen und Ausnahmeregelungen.</p>
          
          {concessionsData ? (
            <div className="mt-6 p-4 border rounded bg-slate-50">
              <h3 className="text-lg font-semibold mb-2">Geladene Concessions-Daten</h3>
              <p>Dateiname: {concessionsData.fileName}</p>
              <p>Dateityp: {concessionsData.type.toUpperCase()}</p>
              {/* Hier könnte eine spezifische Darstellung der Concessions-Daten erfolgen */}
            </div>
          ) : (
            renderNoDataMessage("Concessions")
          )}
        </div>
      );
    }
    
    // Default fallback (should not happen due to routing)
    return (
      <div className="p-4 border rounded-lg bg-background">
        <h2 className="text-2xl font-bold mb-4">Qualitätsmanagement</h2>
        <p>Wählen Sie eine Kategorie in der Seitenleiste aus.</p>
      </div>
    );
  };
  
  // Hilfsfunktion für die "Keine Daten" Meldung
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Qualitätsmanagement</h1>
      {renderContent()}
    </div>
  );
};

export default QualityPage;
