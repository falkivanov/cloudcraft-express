
import { DriverKPI } from "../../../../types";

/**
 * Generate sample driver data when extraction fails
 */
export const generateSampleDrivers = (): DriverKPI[] => {
  return [
    {
      name: "TR-001",
      status: "active",
      metrics: [
        { name: "Stops", value: 120, target: 0, unit: "", status: "fantastic" },
        { name: "Delivered", value: 98, target: 100, unit: "%", status: "great" },
        { name: "DNR DPMO", value: 2500, target: 3000, unit: "DPMO", status: "great" },
        { name: "POD", value: 99, target: 98, unit: "%", status: "fantastic" },
        { name: "Contact Compliance", value: 92, target: 95, unit: "%", status: "fair" },
        { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
        { name: "DEX", value: 96, target: 95, unit: "%", status: "fantastic" }
      ]
    },
    {
      name: "TR-002",
      status: "active",
      metrics: [
        { name: "Stops", value: 150, target: 0, unit: "", status: "fantastic" },
        { name: "Delivered", value: 99, target: 100, unit: "%", status: "fantastic" },
        { name: "DNR DPMO", value: 2000, target: 3000, unit: "DPMO", status: "fantastic" },
        { name: "POD", value: 100, target: 98, unit: "%", status: "fantastic" },
        { name: "Contact Compliance", value: 96, target: 95, unit: "%", status: "fantastic" },
        { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
        { name: "DEX", value: 97, target: 95, unit: "%", status: "fantastic" }
      ]
    }
  ];
};
