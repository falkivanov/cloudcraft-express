
import { Vehicle } from "@/types/vehicle";
import { activeVehiclesBatch1 } from "./vehicle/activeVehicles";
import { activeVehiclesBatch2 } from "./vehicle/activeVehiclesBatch2";
import { workshopVehicles } from "./vehicle/activeVehicles";
import { defleeetedVehicles } from "./vehicle/defleeetedVehicles";
import { sampleRepairs } from "./vehicle/sampleRepairs";
import { sampleAppointments } from "./vehicle/sampleAppointments";

// Export repair and appointment data
export { sampleRepairs } from "./vehicle/sampleRepairs";
export { sampleAppointments } from "./vehicle/sampleAppointments";

// Combine all vehicles into a single array (now empty)
export const initialVehicles: Vehicle[] = [
  ...activeVehiclesBatch1,
  ...activeVehiclesBatch2,
  ...workshopVehicles,
  ...defleeetedVehicles
];
