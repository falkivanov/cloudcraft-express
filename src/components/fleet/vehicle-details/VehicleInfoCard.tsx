
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/types/vehicle";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface VehicleInfoCardProps {
  vehicle: Vehicle;
}

const VehicleInfoCard = ({ vehicle }: VehicleInfoCardProps) => {
  const formatDateString = (dateString: string | null): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch (error) {
      console.error("Invalid date format", error);
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fahrzeugdetails</CardTitle>
        <CardDescription>Grundlegende Informationen über das Fahrzeug</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kennzeichen</Label>
          <div className="font-medium">{vehicle.licensePlate}</div>
        </div>
        <div className="space-y-2">
          <Label>Marke</Label>
          <div className="font-medium">{vehicle.brand}</div>
        </div>
        <div className="space-y-2">
          <Label>Modell</Label>
          <div className="font-medium">{vehicle.model}</div>
        </div>
        <div className="space-y-2">
          <Label>FIN (VIN)</Label>
          <div className="font-medium">{vehicle.vinNumber}</div>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="font-medium">{vehicle.status}</div>
        </div>
        <div className="space-y-2">
          <Label>Infleet Datum</Label>
          <div className="font-medium">{formatDateString(vehicle.infleetDate)}</div>
        </div>
        {vehicle.defleetDate && (
          <div className="space-y-2">
            <Label>Defleet Datum</Label>
            <div className="font-medium">{formatDateString(vehicle.defleetDate)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleInfoCard;
