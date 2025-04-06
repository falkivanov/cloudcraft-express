
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { calculateComplianceStatistics } from "@/components/quality/utils/parseCustomerContactData";
import { DriverComplianceData } from "./types";

interface ComplianceStatisticsProps {
  driversData: DriverComplianceData[];
}

const ComplianceStatistics: React.FC<ComplianceStatisticsProps> = ({ driversData }) => {
  const stats = calculateComplianceStatistics(driversData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Critical Drivers (&lt;85%)</p>
            <p className="text-2xl font-bold text-red-700">{stats.criticalDrivers}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Need Improvement (85-97.9%)</p>
            <p className="text-2xl font-bold text-amber-700">{stats.improvementDrivers}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Good Drivers (≥98%)</p>
            <p className="text-2xl font-bold text-green-700">{stats.goodDrivers}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Contact Ratio</p>
            <p className="text-2xl font-bold">
              {stats.totalAddresses > 0
                ? ((stats.totalContacts / stats.totalAddresses) * 100).toFixed(2)
                : "0.00"}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceStatistics;
