
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Wrench, CheckCircle } from "lucide-react";
import { Vehicle } from "@/types/vehicle";

interface FleetStatsProps {
  vehicles: Vehicle[];
}

const FleetStatsOverview = ({ vehicles }: FleetStatsProps) => {
  // Calculate stats
  const totalVehicles = vehicles.filter(v => v.status !== "Defleet").length;
  const activeVehicles = vehicles.filter(v => v.status === "Aktiv").length;
  const inWorkshopVehicles = vehicles.filter(v => v.status === "In Werkstatt").length;
  
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-wrap justify-between p-6">
        <StatItem 
          title="Gesamte Fahrzeuge" 
          value={totalVehicles} 
          icon={<Truck className="h-6 w-6 text-blue-500" />} 
        />
        <StatItem 
          title="Aktive Fahrzeuge" 
          value={activeVehicles} 
          icon={<CheckCircle className="h-6 w-6 text-green-500" />} 
        />
        <StatItem 
          title="In Werkstatt" 
          value={inWorkshopVehicles} 
          icon={<Wrench className="h-6 w-6 text-orange-500" />} 
        />
      </CardContent>
    </Card>
  );
};

interface StatItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatItem = ({ title, value, icon }: StatItemProps) => (
  <div className="flex items-center space-x-3 p-2">
    <div className="rounded-full bg-muted p-2">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default FleetStatsOverview;
