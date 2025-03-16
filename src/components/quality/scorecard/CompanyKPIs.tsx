
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScorecardKPI } from "./types";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CompanyKPIsProps {
  companyKPIs: ScorecardKPI[];
}

const CompanyKPIs: React.FC<CompanyKPIsProps> = ({ companyKPIs }) => {
  // Get KPI status style 
  const getKPIStatusStyle = (value: number, target: number, trend: "up" | "down" | "neutral") => {
    if (trend === "up") {
      return value >= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    } else if (trend === "down") {
      return value <= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };
  
  // Prepare chart data
  const prepareChartData = (kpis: ScorecardKPI[]) => {
    return kpis.map(kpi => ({
      name: kpi.name,
      value: kpi.value,
      target: kpi.target
    }));
  };

  return (
    <>
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
    </>
  );
};

export default CompanyKPIs;
