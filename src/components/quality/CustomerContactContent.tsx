
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, AlertTriangle, FilterIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

interface CustomerContactContentProps {
  customerContactData: string | null;
  driversData: DriverComplianceData[];
}

const CustomerContactContent: React.FC<CustomerContactContentProps> = ({ 
  customerContactData, 
  driversData 
}) => {
  const [filterValue, setFilterValue] = useState<string>("all");
  
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

  // Filter drivers based on compliance
  const getFilteredDrivers = () => {
    if (filterValue === "low") {
      return driversData.filter(driver => driver.compliancePercentage < 85);
    } else if (filterValue === "medium") {
      return driversData.filter(driver => driver.compliancePercentage >= 85 && driver.compliancePercentage < 98);
    } else if (filterValue === "high") {
      return driversData.filter(driver => driver.compliancePercentage >= 98);
    }
    return driversData;
  };

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
  const filteredDrivers = getFilteredDrivers();

  if (!customerContactData) {
    return renderNoDataMessage("Customer Contact");
  }

  return (
    <div className="mt-6 space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="drivers">Fahrerdaten</TabsTrigger>
          <TabsTrigger value="report">Vollständiger Bericht</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
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
                <CardDescription>< 85%</CardDescription>
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
        </TabsContent>
        
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Fahrerübersicht</span>
                <div className="flex items-center space-x-2">
                  <FilterIcon className="h-4 w-4 mr-1" />
                  <select 
                    className="text-sm border rounded p-1"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  >
                    <option value="all">Alle Fahrer</option>
                    <option value="low">Niedrige Compliance (&lt;85%)</option>
                    <option value="medium">Mittlere Compliance (85-97%)</option>
                    <option value="high">Hohe Compliance (≥98%)</option>
                  </select>
                </div>
              </CardTitle>
              <CardDescription>
                {filteredDrivers.length} Fahrer angezeigt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Adressen</TableHead>
                    <TableHead>Kontakte</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.totalAddresses}</TableCell>
                      <TableCell>{driver.totalContacts}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{driver.compliancePercentage}%</span>
                          <Progress 
                            value={driver.compliancePercentage} 
                            className={`w-20 h-2 ${getProgressColor(driver.compliancePercentage)}`} 
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getComplianceStyle(driver.compliancePercentage)}>
                          {driver.compliancePercentage < 85 ? "Kritisch" : 
                           driver.compliancePercentage < 98 ? "Verbesserungsbedarf" : "Gut"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="report">
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
        </TabsContent>
      </Tabs>
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

export default CustomerContactContent;
