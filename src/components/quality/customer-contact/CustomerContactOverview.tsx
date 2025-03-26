
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DriverComplianceData } from "./types";
import { calculateComplianceStatistics } from "@/components/quality/utils/parseCustomerContactData";
import { getComplianceStyle } from "./utils";

interface CustomerContactOverviewProps {
  driversData: DriverComplianceData[];
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

const CustomerContactOverview: React.FC<CustomerContactOverviewProps> = ({ 
  driversData, 
  onFilterChange,
  activeFilter
}) => {
  const stats = calculateComplianceStatistics(driversData);

  const getTextColorByCompliance = (percentage: number) => {
    if (percentage < 85) return "text-red-600";
    if (percentage < 98) return "text-amber-600";
    return "text-green-600";
  };

  const getCardStyle = (filter: string) => {
    const baseClass = "cursor-pointer hover:shadow-md transition-shadow";
    return activeFilter === filter 
      ? `${baseClass} ring-2 ring-primary` 
      : baseClass;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={getCardStyle("all")}
          onClick={() => onFilterChange("all")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittliche Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTextColorByCompliance(stats.averageCompliance)}`}>
              {stats.averageCompliance.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={getCardStyle("high")}
          onClick={() => onFilterChange("high")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hohe Compliance</CardTitle>
            <div className="text-xs text-muted-foreground">≥ 98%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.goodDrivers}</div>
            <div className="text-xs text-muted-foreground">von {stats.totalDrivers} Fahrern</div>
          </CardContent>
        </Card>
        
        <Card 
          className={getCardStyle("medium")}
          onClick={() => onFilterChange("medium")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mittlere Compliance</CardTitle>
            <div className="text-xs text-muted-foreground">85% - 97%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.improvementDrivers}</div>
            <div className="text-xs text-muted-foreground">von {stats.totalDrivers} Fahrern</div>
          </CardContent>
        </Card>
        
        <Card 
          className={getCardStyle("low")}
          onClick={() => onFilterChange("low")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Niedrige Compliance</CardTitle>
            <div className="text-xs text-muted-foreground">&lt; 85%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalDrivers}</div>
            <div className="text-xs text-muted-foreground">von {stats.totalDrivers} Fahrern</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerContactOverview;
