
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverChange } from "../hooks/useDriverPerformanceData";
import { DriverKPI } from "../types";
import { loadFromStorage, STORAGE_KEYS } from "@/utils/storage";
import { Employee } from "@/types/employee";

interface DriverPerformanceCardProps {
  title: string;
  icon: React.ReactNode;
  driverData: DriverChange[] | DriverKPI[];
  type: "improved" | "worsened" | "highPerformers";
  fullWidth?: boolean;
}

const DriverPerformanceCard: React.FC<DriverPerformanceCardProps> = ({
  title,
  icon,
  driverData,
  type,
  fullWidth = false
}) => {
  const isChangeData = (item: any): item is DriverChange => 
    'change' in item && 'previousScore' in item && 'currentScore' in item;
  
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});

  // Load employee data on component mount
  useEffect(() => {
    const loadEmployeeData = () => {
      const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
      if (!employees) return;
      
      // Create a mapping of transporter IDs to employee names
      const idToNameMap: Record<string, string> = {};
      
      // For each driver in our data, try to find a matching employee
      driverData.forEach(item => {
        const transporterId = isChangeData(item) ? item.driver.name : item.name;
        
        const matchingEmployee = employees.find(
          emp => emp.transporterId === transporterId
        );
        
        if (matchingEmployee) {
          idToNameMap[transporterId] = matchingEmployee.name;
        }
      });
      
      setDisplayNames(idToNameMap);
    };
    
    loadEmployeeData();
    
    // Listen for employee data changes
    const handleEmployeesUpdated = () => {
      loadEmployeeData();
    };
    
    window.addEventListener('employees-updated', handleEmployeesUpdated);
    
    return () => {
      window.removeEventListener('employees-updated', handleEmployeesUpdated);
    };
  }, [driverData]);
  
  // Helper function to get display name
  const getDisplayName = (transporterId: string): string => {
    return displayNames[transporterId] || transporterId;
  };

  return (
    <Card className={fullWidth ? "w-full" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className={`${fullWidth ? "text-lg" : "text-sm"} font-medium flex items-center gap-2`}>
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {driverData.length > 0 ? (
          <div className="space-y-4">
            {driverData.map((item) => (
              <div 
                key={isChangeData(item) ? item.driver.name : item.name} 
                className={`flex items-center justify-between ${fullWidth ? "border-b pb-2" : ""}`}
              >
                <div className="flex-1">
                  <p className={fullWidth ? "font-medium" : "text-sm font-medium"}>
                    {getDisplayName(isChangeData(item) ? item.driver.name : item.name)}
                  </p>
                  <div className={`flex items-center gap-1 ${fullWidth ? "text-sm" : "text-xs"} text-muted-foreground`}>
                    {isChangeData(item) ? (
                      <>
                        <span>Vorwoche: {item.previousScore}</span>
                        <span>→</span>
                        <span>Aktuell: {item.currentScore}</span>
                      </>
                    ) : (
                      <span>Perfekter Score in beiden Wochen</span>
                    )}
                  </div>
                </div>
                {type === "improved" && isChangeData(item) && (
                  <div className={`bg-green-100 text-green-700 font-medium ${fullWidth ? "px-3 py-1 rounded-full" : "text-sm px-2 py-1 rounded"}`}>
                    +{item.change}
                  </div>
                )}
                {type === "worsened" && isChangeData(item) && (
                  <div className={`bg-red-100 text-red-700 font-medium ${fullWidth ? "px-3 py-1 rounded-full" : "text-sm px-2 py-1 rounded"}`}>
                    {item.change}
                  </div>
                )}
                {type === "highPerformers" && (
                  <div className={`bg-yellow-100 text-yellow-700 font-medium ${fullWidth ? "px-3 py-1 rounded-full" : "text-sm px-2 py-1 rounded"}`}>
                    100
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={`${fullWidth ? "" : "text-sm"} text-muted-foreground text-center py-4`}>
            {type === "improved" && "Keine Verbesserungen in dieser Woche"}
            {type === "worsened" && "Keine Verschlechterungen in dieser Woche"}
            {type === "highPerformers" && "Keine perfekten Performer in beiden Wochen"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverPerformanceCard;
