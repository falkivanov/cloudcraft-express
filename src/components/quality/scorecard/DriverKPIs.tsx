
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DriverKPI } from "./types";

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
  // Get driver KPI status style
  const getDriverKPIStyle = (value: number, target: number, metric: string) => {
    if (metric === "DPMO" || metric === "DNR") {
      return value <= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    } else {
      return value >= target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
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
          {filteredDriverKPIs.length > 0 ? (
            filteredDriverKPIs.map((driver, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{driver.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {driver.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="p-3 border rounded-md">
                        <div className="text-sm font-medium mb-1">{metric.name}</div>
                        <div className="flex justify-between items-center">
                          <Badge className={getDriverKPIStyle(metric.value, metric.target, metric.name)}>
                            {metric.value}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Ziel: {metric.target}
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
      </Tabs>
    </div>
  );
};

export default DriverKPIs;
