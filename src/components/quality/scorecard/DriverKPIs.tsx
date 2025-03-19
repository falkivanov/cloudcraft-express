import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DriverKPIsProps } from "./types";
import { ArrowUp, ArrowDown, CircleDot } from "lucide-react";

const DriverKPIs: React.FC<DriverKPIsProps> = ({ 
  driverKPIs, 
  driverStatusTab, 
  setDriverStatusTab,
  previousWeekData
}) => {
  // Function to get status badge styling
  const getStatusClass = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-500";
    
    switch (status.toLowerCase()) {
      case "fantastic":
        return "bg-blue-100 text-blue-600";
      case "great":
        return "bg-yellow-100 text-yellow-600";
      case "fair":
        return "bg-orange-100 text-orange-600";
      case "poor":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  // Filter drivers by status
  const activeDrivers = driverKPIs.filter(driver => driver.status === "active");
  const formerDrivers = driverKPIs.filter(driver => driver.status === "former");
  
  // Find previous week's data for a driver
  const getPreviousDriverData = (driverName: string) => {
    if (!previousWeekData) return null;
    return previousWeekData.driverKPIs.find(d => d.name === driverName) || null;
  };
  
  // Get previous metric data
  const getPreviousMetricData = (driverName: string, metricName: string) => {
    const prevDriver = getPreviousDriverData(driverName);
    if (!prevDriver) return null;
    
    return prevDriver.metrics.find(m => m.name === metricName) || null;
  };
  
  // Format value based on metric name
  const formatValue = (value: number, unit: string) => {
    return Math.round(value);
  };
  
  // Function to calculate and format the change from previous week
  const getChangeDisplay = (current: number, previousValue: number | null) => {
    if (previousValue === null) return null;
    
    const difference = current - previousValue;
    const isPositive = difference > 0;
    
    return {
      difference,
      display: `${isPositive ? "+" : ""}${Math.round(difference)}`,
      isPositive
    };
  };

  // Render a table row for a driver with metrics
  const renderDriverRow = (driver: any) => {
    return (
      <tr key={driver.name} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-2 px-3 text-sm font-medium">{driver.name}</td>
        
        {driver.metrics.map((metric: any) => {
          const prevMetric = getPreviousMetricData(driver.name, metric.name);
          const prevValue = prevMetric ? prevMetric.value : null;
          const change = getChangeDisplay(metric.value, prevValue);
          
          // Check if the metric value meets its target (if available)
          const isAtOrBetterThanTarget = metric.target ? 
            (metric.name === "DNR DPMO" ? metric.value <= metric.target : metric.value >= metric.target) : 
            false;
          
          // Determine if change is positive or negative
          const isGoodChange = change && (
            (metric.name === "DNR DPMO" ? change.difference < 0 : change.difference > 0) ||
            // Add condition: if change is 0 but we meet the target, consider it positive
            (change.difference === 0 && isAtOrBetterThanTarget)
          );
          
          const changeColor = change ? 
            (isGoodChange ? "text-green-500" : "text-red-500") : 
            "";
          
          return (
            <td key={metric.name} className="py-2 px-3 text-right">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span>{formatValue(metric.value, metric.unit)}{metric.unit}</span>
                  
                  {change && (
                    <span className={`text-xs flex items-center ${changeColor}`}>
                      {isGoodChange ? (
                        <ArrowUp className="h-3 w-3 mr-0.5" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-0.5" />
                      )}
                      {change.display}
                    </span>
                  )}
                </div>
                
                {metric.status && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusClass(metric.status)}`}>
                    {metric.status}
                  </span>
                )}
              </div>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section header with period */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Fahrerkennzahlen</h2>
        {previousWeekData && (
          <span className="text-xs text-gray-500 italic">Vergleich: KW{previousWeekData.week}/{previousWeekData.year}</span>
        )}
      </div>
      
      {/* Tabs for active/former drivers */}
      <Tabs value={driverStatusTab} onValueChange={setDriverStatusTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Aktive Fahrer ({activeDrivers.length})</TabsTrigger>
          <TabsTrigger value="former">Ehemalige Fahrer ({formerDrivers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activeDrivers.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="py-1 px-3">Fahrer</th>
                    {activeDrivers[0].metrics.map((metric: any) => (
                      <th key={metric.name} className="py-1 px-3 text-right">{metric.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDrivers.map(renderDriverRow)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">Keine aktiven Fahrer vorhanden</div>
          )}
        </TabsContent>
        
        <TabsContent value="former">
          {formerDrivers.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="py-1 px-3">Fahrer</th>
                    {formerDrivers[0].metrics.map((metric: any) => (
                      <th key={metric.name} className="py-1 px-3 text-right">{metric.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formerDrivers.map(renderDriverRow)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">Keine ehemaligen Fahrer vorhanden</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverKPIs;
