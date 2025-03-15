
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vehicle, RepairEntry } from "@/types/vehicle";
import { subDays, subMonths, isAfter, parseISO } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Bar, BarChart } from "recharts";
import { DollarSign, Clock, TrendingUp } from "lucide-react";

interface CostSummaryProps {
  vehicles: Vehicle[];
}

interface TimeFrame {
  label: string;
  icon: React.ReactNode;
  days?: number;
  months?: number;
}

const CostSummaryDashboard = ({ vehicles }: CostSummaryProps) => {
  const timeFrames: TimeFrame[] = [
    { label: "Letzte 4 Wochen", icon: <Clock className="h-4 w-4" />, days: 28 },
    { label: "Letzte 3 Monate", icon: <TrendingUp className="h-4 w-4" />, months: 3 },
    { label: "Letzte 12 Monate", icon: <DollarSign className="h-4 w-4" />, months: 12 }
  ];

  // Get all repairs from all vehicles
  const allRepairs = useMemo(() => {
    return vehicles.flatMap(vehicle => 
      vehicle.repairs?.map(repair => ({
        ...repair,
        vehicleLicensePlate: vehicle.licensePlate
      })) || []
    );
  }, [vehicles]);

  // Calculate costs for each time frame
  const costSummaries = useMemo(() => {
    const today = new Date();
    
    return timeFrames.map(timeFrame => {
      let startDate;
      if (timeFrame.days) {
        startDate = subDays(today, timeFrame.days);
      } else if (timeFrame.months) {
        startDate = subMonths(today, timeFrame.months);
      }
      
      // Filter repairs within the time frame
      const relevantRepairs = allRepairs.filter(repair => {
        const repairDate = parseISO(repair.startDate);
        return isAfter(repairDate, startDate);
      });
      
      // Calculate total costs
      const totalCost = relevantRepairs.reduce((sum, repair) => sum + repair.totalCost, 0);
      const companyPaidCost = relevantRepairs.reduce((sum, repair) => sum + repair.companyPaidAmount, 0);
      const employeePaidCost = totalCost - companyPaidCost;
      
      return {
        timeFrame: timeFrame.label,
        icon: timeFrame.icon,
        totalCost,
        companyPaidCost,
        employeePaidCost,
        repairCount: relevantRepairs.length
      };
    });
  }, [allRepairs, timeFrames]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    return costSummaries.map(summary => ({
      name: summary.timeFrame,
      Gesamt: Math.round(summary.totalCost),
      Unternehmen: Math.round(summary.companyPaidCost),
      Mitarbeiter: Math.round(summary.employeePaidCost)
    }));
  }, [costSummaries]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Reparaturkosten Übersicht</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {costSummaries.map((summary, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 border rounded-md">
              <div className="rounded-full bg-muted p-2">
                {summary.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{summary.timeFrame}</p>
                <p className="text-lg font-bold">{summary.totalCost.toLocaleString('de-DE')} €</p>
                <p className="text-xs text-muted-foreground">
                  Unternehmen: {summary.companyPaidCost.toLocaleString('de-DE')} € 
                  {summary.repairCount > 0 && ` (${summary.repairCount} Reparaturen)`}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="h-72">
          <ChartContainer 
            config={{
              Gesamt: { theme: { light: "#4338ca", dark: "#818cf8" } },
              Unternehmen: { theme: { light: "#0ea5e9", dark: "#38bdf8" } },
              Mitarbeiter: { theme: { light: "#f97316", dark: "#fb923c" } },
            }}
          >
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-md p-2 shadow-md">
                        <p className="font-bold">{label}</p>
                        {payload.map((item, index) => (
                          <p key={index} style={{ color: item.color }}>
                            {item.name}: {item.value.toLocaleString('de-DE')} €
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="Gesamt" fill="var(--color-Gesamt)" />
              <Bar dataKey="Unternehmen" fill="var(--color-Unternehmen)" />
              <Bar dataKey="Mitarbeiter" fill="var(--color-Mitarbeiter)" />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostSummaryDashboard;
