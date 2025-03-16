
import { useMemo } from "react";
import { Vehicle } from "@/types/vehicle";

type GroupKey = "brand" | "model" | "status" | "none";

export const useGroupedVehicles = (vehicles: Vehicle[], groupBy: GroupKey = "none") => {
  const groupedVehicles = useMemo(() => {
    if (groupBy === "none") {
      return { "Alle Fahrzeuge": vehicles };
    }

    return vehicles.reduce((acc, vehicle) => {
      const key = vehicle[groupBy] as string;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(vehicle);
      return acc;
    }, {} as Record<string, Vehicle[]>);
  }, [vehicles, groupBy]);

  return groupedVehicles;
};
