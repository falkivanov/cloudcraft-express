
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverChange } from "../hooks/useDriverPerformanceData";
import { DriverKPI } from "../types";

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
                    {isChangeData(item) ? item.driver.name : item.name}
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
