
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DriverComplianceData } from "./types";
import { calculateComplianceStatistics } from "@/components/quality/utils/parseCustomerContactData";
import { getComplianceStyle, getProgressColor } from "./utils";

interface CustomerContactOverviewProps {
  driversData: DriverComplianceData[];
}

const CustomerContactOverview: React.FC<CustomerContactOverviewProps> = ({ driversData }) => {
  const stats = calculateComplianceStatistics(driversData);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittliche Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompliance.toFixed(1)}%</div>
            <Progress 
              value={stats.averageCompliance} 
              className={`mt-2 h-2 ${getProgressColor(stats.averageCompliance)}`} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hohe Compliance</CardTitle>
            <div className="text-xs text-muted-foreground">≥ 98%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.goodDrivers}</div>
            <div className="text-xs text-muted-foreground">von {stats.totalDrivers} Fahrern</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mittlere Compliance</CardTitle>
            <div className="text-xs text-muted-foreground">85% - 97%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.improvementDrivers}</div>
            <div className="text-xs text-muted-foreground">von {stats.totalDrivers} Fahrern</div>
          </CardContent>
        </Card>
        
        <Card>
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
