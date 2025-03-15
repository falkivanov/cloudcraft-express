
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard 
        title="Gesamte Fahrzeuge" 
        value={totalVehicles} 
        icon={<Truck className="h-8 w-8 text-blue-500" />} 
        description="Alle aktiven Fahrzeuge im Fuhrpark"
      />
      <StatCard 
        title="Aktive Fahrzeuge" 
        value={activeVehicles} 
        icon={<CheckCircle className="h-8 w-8 text-green-500" />} 
        description="Fahrzeuge im normalen Betrieb"
      />
      <StatCard 
        title="In Werkstatt" 
        value={inWorkshopVehicles} 
        icon={<Wrench className="h-8 w-8 text-orange-500" />} 
        description="Aktuell in Reparatur oder Wartung"
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => (
  <Card>
    <CardContent className="flex items-center p-6">
      <div className="mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

export default FleetStatsOverview;
