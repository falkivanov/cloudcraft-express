
import { DriverKPI } from '../../../../types';

/**
 * Generate sample driver data when extraction fails
 */
export const generateSampleDrivers = (): DriverKPI[] => {
  return [
    {
      name: "TR-001",
      status: "active",
      metrics: [
        { name: "Delivered", value: 98, target: 100, unit: "%", status: "great" as const },
        { name: "DNR DPMO", value: 2500, target: 3000, unit: "DPMO", status: "great" as const },
        { name: "Contact Compliance", value: 92, target: 95, unit: "%", status: "fair" as const }
      ]
    },
    {
      name: "TR-002",
      status: "active",
      metrics: [
        { name: "Delivered", value: 99, target: 100, unit: "%", status: "fantastic" as const },
        { name: "DNR DPMO", value: 2000, target: 3000, unit: "DPMO", status: "fantastic" as const },
        { name: "Contact Compliance", value: 96, target: 95, unit: "%", status: "fantastic" as const }
      ]
    }
  ];
};
