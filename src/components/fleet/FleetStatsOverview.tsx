
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Wrench, CheckCircle } from "lucide-react";
import { Vehicle } from "@/types/vehicle";

interface FleetStatsProps {
  vehicles: Vehicle[];
  onFilterChange?: (status: "all" | "active" | "workshop") => void;
  activeFilter?: "all" | "active" | "workshop";
}

const FleetStatsOverview = ({ vehicles, onFilterChange, activeFilter = "all" }: FleetStatsProps) => {
  // Calculate stats
  const totalVehicles = vehicles.filter(v => v.status !== "Defleet").length;
  const activeVehicles = vehicles.filter(v => v.status === "Aktiv").length;
  const inWorkshopVehicles = vehicles.filter(v => v.status === "In Werkstatt").length;
  
  const handleStatClick = (statusFilter: "all" | "active" | "workshop") => {
    if (onFilterChange) {
      // If the same filter is already active, reset to "all"
      const newFilter = activeFilter === statusFilter ? "all" : statusFilter;
      onFilterChange(newFilter);
    }
  };
  
  return (
    <Card className="mb-3">
      <CardContent className="flex flex-wrap justify-between p-3">
        <StatItem 
          title="Gesamte Fahrzeuge" 
          value={totalVehicles} 
          icon={<Truck className="h-5 w-5 text-blue-500" />} 
          onClick={() => handleStatClick("all")}
          clickable={!!onFilterChange}
          active={activeFilter === "all"}
        />
        <StatItem 
          title="Aktive Fahrzeuge" 
          value={activeVehicles} 
          icon={<CheckCircle className="h-5 w-5 text-green-500" />} 
          onClick={() => handleStatClick("active")}
          clickable={!!onFilterChange}
          active={activeFilter === "active"}
        />
        <StatItem 
          title="In Werkstatt" 
          value={inWorkshopVehicles} 
          icon={<Wrench className="h-5 w-5 text-orange-500" />} 
          onClick={() => handleStatClick("workshop")}
          clickable={!!onFilterChange}
          active={activeFilter === "workshop"}
        />
      </CardContent>
    </Card>
  );
};

interface StatItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
  active?: boolean;
}

const StatItem = ({ title, value, icon, onClick, clickable, active }: StatItemProps) => (
  <div 
    className={`flex items-center space-x-2 p-2 ${clickable ? 'cursor-pointer hover:bg-gray-100 rounded-md transition-colors' : ''} ${active ? 'bg-gray-100 rounded-md' : ''}`}
    onClick={onClick}
  >
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
