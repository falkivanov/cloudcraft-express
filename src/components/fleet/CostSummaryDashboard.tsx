
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Vehicle } from "@/types/vehicle";
import { subDays, subMonths, isAfter, parseISO } from "date-fns";
import { Clock, TrendingUp, DollarSign } from "lucide-react";

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

  return (
    <Card className="mb-6">
      <CardContent className="pt-4 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {costSummaries.map((summary, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 border rounded-md">
              <div className="rounded-full bg-muted p-2">
                {summary.icon}
              </div>
              <div className="w-full">
                <p className="text-xs font-medium text-muted-foreground">{summary.timeFrame}</p>
                <p className="text-xl font-bold">{summary.companyPaidCost.toLocaleString('de-DE')} €</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Gesamt: {summary.totalCost.toLocaleString('de-DE')} €
                  </p>
                  {summary.repairCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {summary.repairCount} Reparaturen
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">Reparaturkosten Übersicht</p>
      </CardContent>
    </Card>
  );
};

export default CostSummaryDashboard;
