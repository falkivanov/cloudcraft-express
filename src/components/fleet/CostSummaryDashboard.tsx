import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Vehicle } from "@/types/vehicle";
import { subDays, subMonths, isAfter, parseISO, addMonths, format } from "date-fns";
import { Clock, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CostSummaryProps {
  vehicles: Vehicle[];
}

interface TimeFrame {
  label: string;
  icon: React.ReactNode;
  days?: number;
  months?: number;
}

interface CostSummary {
  timeFrame: string;
  icon: React.ReactNode;
  companyPaidCost: number;
  repairCount: number;
  percentChange: number;
  vehicleCount: {
    current: number;
    previous: number;
  };
}

const CostSummaryDashboard = ({ vehicles }: CostSummaryProps) => {
  const timeFrames: TimeFrame[] = [
    { label: "Letzte 4 Wochen", icon: <Clock className="h-4 w-4" />, days: 28 },
    { label: "Letzte 3 Monate", icon: <TrendingUp className="h-4 w-4" />, months: 3 },
    { label: "Letzte 12 Monate", icon: <DollarSign className="h-4 w-4" />, months: 12 }
  ];

  const allRepairs = useMemo(() => {
    return vehicles.flatMap(vehicle => 
      vehicle.repairs?.map(repair => ({
        ...repair,
        vehicleLicensePlate: vehicle.licensePlate
      })) || []
    );
  }, [vehicles]);

  const costSummaries: CostSummary[] = useMemo(() => {
    const today = new Date();
    
    return timeFrames.map(timeFrame => {
      let currentStartDate;
      if (timeFrame.days) {
        currentStartDate = subDays(today, timeFrame.days);
      } else if (timeFrame.months) {
        currentStartDate = subMonths(today, timeFrame.months);
      }
      
      let previousStartDate;
      let previousEndDate;
      if (timeFrame.days) {
        previousStartDate = subDays(currentStartDate, timeFrame.days);
        previousEndDate = subDays(currentStartDate, 1);
      } else if (timeFrame.months) {
        previousStartDate = subMonths(currentStartDate, timeFrame.months);
        previousEndDate = subDays(currentStartDate, 1);
      }
      
      const currentRepairs = allRepairs.filter(repair => {
        const repairDate = parseISO(repair.startDate);
        return isAfter(repairDate, currentStartDate);
      });
      
      const previousRepairs = allRepairs.filter(repair => {
        const repairDate = parseISO(repair.startDate);
        return isAfter(repairDate, previousStartDate) && !isAfter(repairDate, previousEndDate);
      });
      
      const activeVehiclesInCurrentPeriod = new Set(
        currentRepairs.map(repair => repair.vehicleLicensePlate)
      ).size;
      
      const activeVehiclesInPreviousPeriod = new Set(
        previousRepairs.map(repair => repair.vehicleLicensePlate)
      ).size;
      
      const currentCompanyPaidCost = currentRepairs.reduce((sum, repair) => sum + repair.companyPaidAmount, 0);
      const previousCompanyPaidCost = previousRepairs.reduce((sum, repair) => sum + repair.companyPaidAmount, 0);
      
      const currentNormalizedCost = activeVehiclesInCurrentPeriod > 0 
        ? currentCompanyPaidCost / activeVehiclesInCurrentPeriod 
        : 0;
      
      const previousNormalizedCost = activeVehiclesInPreviousPeriod > 0 
        ? previousCompanyPaidCost / activeVehiclesInPreviousPeriod 
        : 0;
      
      let percentChange = 0;
      if (previousNormalizedCost > 0) {
        percentChange = ((currentNormalizedCost - previousNormalizedCost) / previousNormalizedCost) * 100;
      } else if (currentNormalizedCost > 0) {
        percentChange = 100;
      }
      
      return {
        timeFrame: timeFrame.label,
        icon: timeFrame.icon,
        companyPaidCost: currentCompanyPaidCost,
        repairCount: currentRepairs.length,
        percentChange,
        vehicleCount: {
          current: activeVehiclesInCurrentPeriod,
          previous: activeVehiclesInPreviousPeriod
        }
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
                {summary.percentChange !== 0 && (
                  <div className="flex items-center mt-1">
                    {summary.percentChange > 0 ? (
                      <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200 flex items-center gap-0.5 py-0">
                        <ArrowUpRight className="h-2.5 w-2.5" />
                        {Math.abs(summary.percentChange).toFixed(1)}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200 flex items-center gap-0.5 py-0">
                        <ArrowDownRight className="h-2.5 w-2.5" />
                        {Math.abs(summary.percentChange).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                )}
                {summary.repairCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {summary.repairCount} Reparaturen
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end mr-2">
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" align="end" className="whitespace-nowrap">
              Reparaturkosten für das Unternehmen (% Änderung zur Vorperiode, Fahrzeuganzahl-bereinigt)
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostSummaryDashboard;
