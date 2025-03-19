
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScorecardKPI } from "./types";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface CompanyKPIsProps {
  companyKPIs: ScorecardKPI[];
}

const CompanyKPIs: React.FC<CompanyKPIsProps> = ({ companyKPIs }) => {
  // Get KPI status color based on status
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "fantastic":
        return "bg-green-100 text-green-800";
      case "great":
        return "bg-blue-100 text-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get KPI status style 
  const getKPIStatusStyle = (value: number, target: number, trend: "up" | "down" | "neutral", status?: string) => {
    if (status) {
      return getStatusColor(status);
    }
    
    if (trend === "up") {
      return value >= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    } else if (trend === "down") {
      return value <= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };
  
  // Group KPIs by category
  const safetyKPIs = companyKPIs.filter(kpi => 
    ["Vehicle Audit (VSA)", "Safe Driving (FICO)", "DVIC Compliance", "Speeding Event Rate"].includes(kpi.name)
  );
  
  const qualityKPIs = companyKPIs.filter(kpi => 
    ["Delivery Completion Rate (DCR)", "Delivered Not Received (DNR DPMO)", "Photo On Delivery", "Contact Compliance"].includes(kpi.name)
  );
  
  // Prepare chart data
  const prepareChartData = (kpis: ScorecardKPI[]) => {
    return kpis.map(kpi => ({
      name: kpi.name,
      value: kpi.value,
      target: kpi.target
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Compliance and Safety KPIs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {safetyKPIs.map((kpi, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{kpi.name}</span>
                  <Badge className={getKPIStatusStyle(kpi.value, kpi.target, kpi.trend, kpi.status)}>
                    {kpi.value}{kpi.unit}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Ziel: {kpi.target}{kpi.unit}</span>
                  {kpi.status && <span className="capitalize">{kpi.status}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Quality KPIs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {qualityKPIs.map((kpi, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{kpi.name}</span>
                  <Badge className={getKPIStatusStyle(kpi.value, kpi.target, kpi.trend, kpi.status)}>
                    {kpi.value}{kpi.unit}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Ziel: {kpi.target}{kpi.unit}</span>
                  {kpi.status && <span className="capitalize">{kpi.status}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="h-80 w-full mb-4">
        <h3 className="text-lg font-medium mb-4">KPI Overview</h3>
        <ChartContainer config={{}} className="h-full">
          <RechartsBarChart data={prepareChartData(companyKPIs)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={180} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const kpi = companyKPIs.find(k => k.name === payload[0].payload.name);
                  return (
                    <div className="border border-gray-200 bg-white p-2 shadow-sm rounded-md text-xs">
                      <p className="font-bold">{payload[0].payload.name}</p>
                      <p>Aktuell: {payload[0].value}{kpi?.unit || ''}</p>
                      <p>Ziel: {payload[0].payload.target}{kpi?.unit || ''}</p>
                      {kpi?.status && <p className="capitalize">Status: {kpi.status}</p>}
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
    </div>
  );
};

export default CompanyKPIs;
