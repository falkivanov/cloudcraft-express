
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
        { name: "Delivered", value: 1120, target: 0, unit: "", status: "fantastic" },
        { name: "DCR", value: 98, target: 98.5, unit: "%", status: "great" },
        { name: "DNR DPMO", value: 2500, target: 1500, unit: "DPMO", status: "fair" },
        { name: "POD", value: 99, target: 98, unit: "%", status: "fantastic" },
        { name: "CC", value: 92, target: 95, unit: "%", status: "fair" },
        { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
        { name: "DEX", value: 96, target: 95, unit: "%", status: "fantastic" }
      ]
    },
    {
      name: "TR-002",
      status: "active",
      metrics: [
        { name: "Delivered", value: 1350, target: 0, unit: "", status: "fantastic" },
        { name: "DCR", value: 99, target: 98.5, unit: "%", status: "fantastic" },
        { name: "DNR DPMO", value: 2000, target: 1500, unit: "DPMO", status: "fair" },
        { name: "POD", value: 100, target: 98, unit: "%", status: "fantastic" },
        { name: "CC", value: 96, target: 95, unit: "%", status: "fantastic" },
        { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
        { name: "DEX", value: 97, target: 95, unit: "%", status: "fantastic" }
      ]
    },
    {
      name: "TR-003",
      status: "active",
      metrics: [
        { name: "Delivered", value: 980, target: 0, unit: "", status: "great" },
        { name: "DCR", value: 97.5, target: 98.5, unit: "%", status: "fair" },
        { name: "DNR DPMO", value: 1800, target: 1500, unit: "DPMO", status: "fair" },
        { name: "POD", value: 98, target: 98, unit: "%", status: "great" },
        { name: "CC", value: 93, target: 95, unit: "%", status: "fair" },
        { name: "CE", value: 1, target: 0, unit: "", status: "poor" },
        { name: "DEX", value: 94, target: 95, unit: "%", status: "fair" }
      ]
    }
  ];
};
