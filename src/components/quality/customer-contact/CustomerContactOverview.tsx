
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

interface CustomerContactOverviewProps {
  driversData: DriverComplianceData[];
}

const CustomerContactOverview: React.FC<CustomerContactOverviewProps> = ({ driversData }) => {
  // Calculate overall statistics
  const calculateStats = () => {
    if (driversData.length === 0) return { average: 0, low: 0, medium: 0, high: 0 };
    
    const average = driversData.reduce((sum, driver) => sum + driver.compliancePercentage, 0) / driversData.length;
    const low = driversData.filter(driver => driver.compliancePercentage < 85).length;
    const medium = driversData.filter(driver => driver.compliancePercentage >= 85 && driver.compliancePercentage < 98).length;
    const high = driversData.filter(driver => driver.compliancePercentage >= 98).length;
    
    return { average, low, medium, high };
  };

  const stats = calculateStats();

  // Generate personalized message for drivers with compliance below 98%
  const generateDriverMessage = (driver: DriverComplianceData) => {
    const missingContacts = driver.totalAddresses - driver.totalContacts;
    return `Hi ${driver.firstName}, letzte Woche musstest du ${driver.totalAddresses} Kunden kontaktieren, hast aber nur ${driver.totalContacts} kontaktiert (${missingContacts} fehlende Kontakte). Bitte versuch diese Woche auf 100% zu kommen.`;
  };

  // Style for compliance values
  const getComplianceStyle = (percentage: number) => {
    if (percentage < 85) return "bg-red-100 text-red-800 font-semibold";
    if (percentage < 98) return "bg-amber-100 text-amber-800 font-semibold";
    return "bg-green-100 text-green-800 font-semibold";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 85) return "bg-red-500";
    if (percentage < 98) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittliche Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average.toFixed(1)}%</div>
            <Progress 
              value={stats.average} 
              className={`mt-2 h-2 ${getProgressColor(stats.average)}`} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hohe Compliance</CardTitle>
            <CardDescription>≥ 98%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.high}</div>
            <div className="text-xs text-muted-foreground">von {driversData.length} Fahrern</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mittlere Compliance</CardTitle>
            <CardDescription>85% - 97%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.medium}</div>
            <div className="text-xs text-muted-foreground">von {driversData.length} Fahrern</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Niedrige Compliance</CardTitle>
            <CardDescription>&lt; 85%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.low}</div>
            <div className="text-xs text-muted-foreground">von {driversData.length} Fahrern</div>
          </CardContent>
        </Card>
      </div>
      
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
  );
};

export default CustomerContactOverview;
