
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DriverKPI } from "./types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface DriverKPIsProps {
  driverKPIs: DriverKPI[];
  driverStatusTab: string;
  setDriverStatusTab: (value: string) => void;
}

const DriverKPIs: React.FC<DriverKPIsProps> = ({ 
  driverKPIs, 
  driverStatusTab, 
  setDriverStatusTab 
}) => {
  // Get driver KPI status style based on value, target, and metric name
  const getDriverKPIStyle = (value: number, target: number, metric: string, status?: string) => {
    if (status) {
      return getStatusColor(status);
    }
    
    if (metric === "DNR DPMO") {
      return value <= target ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800";
    } else if (metric === "DCR" || metric === "POD" || metric === "Contact Compliance") {
      return value >= target ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get status color based on status string
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "fantastic":
        return "bg-blue-100 text-blue-800";
      case "great":
        return "bg-yellow-100 text-yellow-800";
      case "fair":
        return "bg-orange-100 text-orange-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Filter drivers by status (active or former)
  const filteredDriverKPIs = driverKPIs.filter(driver => 
    driverStatusTab === "active" ? driver.status === "active" : driver.status === "former"
  );

  return (
    <div className="w-full">
      <Tabs value={driverStatusTab} onValueChange={setDriverStatusTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Aktive Fahrer</TabsTrigger>
          <TabsTrigger value="former">Ehemalige Fahrer</TabsTrigger>
        </TabsList>
        
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Fahrer ID</TableHead>
                  <TableHead className="whitespace-nowrap">Delivered</TableHead>
                  <TableHead className="whitespace-nowrap">DCR</TableHead>
                  <TableHead className="whitespace-nowrap">DNR DPMO</TableHead>
                  <TableHead className="whitespace-nowrap">POD</TableHead>
                  <TableHead className="whitespace-nowrap">Contact Compliance</TableHead>
                  <TableHead className="whitespace-nowrap">Focus Area</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDriverKPIs.length > 0 ? (
                  filteredDriverKPIs.map((driver, index) => {
                    // Find metrics by name
                    const delivered = driver.metrics.find(m => m.name === "Delivered");
                    const dcr = driver.metrics.find(m => m.name === "DCR");
                    const dnrDpmo = driver.metrics.find(m => m.name === "DNR DPMO");
                    const pod = driver.metrics.find(m => m.name === "POD");
                    const contactCompliance = driver.metrics.find(m => m.name === "Contact Compliance");
                    
                    // Determine focus area (choosing worst performing metric)
                    const focusArea = "DNR DPMO"; // Default for this example
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{delivered?.value || "N/A"}</TableCell>
                        <TableCell>
                          {dcr && (
                            <Badge className={getDriverKPIStyle(dcr.value, dcr.target, dcr.name, dcr.status)}>
                              {dcr.value}{dcr.unit || "%"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {dnrDpmo && (
                            <Badge className={getDriverKPIStyle(dnrDpmo.value, dnrDpmo.target, dnrDpmo.name, dnrDpmo.status)}>
                              {dnrDpmo.value}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {pod && (
                            <Badge className={getDriverKPIStyle(pod.value, pod.target, pod.name, pod.status)}>
                              {pod.value}{pod.unit || "%"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {contactCompliance && (
                            <Badge className={getDriverKPIStyle(contactCompliance.value, contactCompliance.target, contactCompliance.name, contactCompliance.status)}>
                              {contactCompliance.value}{contactCompliance.unit || "%"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{focusArea}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Keine Fahrer in dieser Kategorie
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 space-y-6">
            <h3 className="text-lg font-medium">Fahrer Details</h3>
            {filteredDriverKPIs.length > 0 ? (
              filteredDriverKPIs.map((driver, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{driver.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {driver.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="p-3 border rounded-md">
                          <div className="text-sm font-medium mb-1">{metric.name}</div>
                          <div className="flex justify-between items-center">
                            <Badge className={getDriverKPIStyle(metric.value, metric.target, metric.name, metric.status)}>
                              {metric.value}{metric.unit || ""}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Ziel: {metric.target}{metric.unit || ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 border rounded-lg bg-gray-50">
                <p className="text-muted-foreground">Keine Fahrer in dieser Kategorie</p>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default DriverKPIs;
