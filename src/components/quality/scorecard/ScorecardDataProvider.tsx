
import { ScoreCardData } from "./types";

// Dummy data based on the PDF content
export const getDummyScoreCardData = (): ScoreCardData => {
  return {
    week: 10,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 75.01,
    overallStatus: "Great",
    rank: 6,
    companyKPIs: [
      { name: "Vehicle Audit (VSA)", value: 97.92, target: 98, unit: "%", trend: "up", status: "great" },
      { name: "Safe Driving (FICO)", value: 795, target: 800, unit: "", trend: "up", status: "great" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate", value: 8, target: 10, unit: "", trend: "down", status: "fantastic" },
      { name: "Delivery Completion Rate (DCR)", value: 98.32, target: 99, unit: "%", trend: "up", status: "fair" },
      { name: "Delivered Not Received (DNR DPMO)", value: 1939, target: 1100, unit: "", trend: "down", status: "poor" },
      { name: "Photo On Delivery", value: 98.35, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 91.61, target: 98, unit: "%", trend: "up", status: "fair" },
    ],
    driverKPIs: [
      { 
        name: "A10PTFSFT1G664", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1057, target: 0, unit: "" },
          { name: "DCR", value: 98.88, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 2838, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 99.54, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 89.36, target: 98, unit: "%", status: "poor" }
        ]
      },
      { 
        name: "A13INOOSIM0DQP", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 995, target: 0, unit: "" },
          { name: "DCR", value: 99.8, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 2010, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.77, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 50, target: 98, unit: "%", status: "poor" }
        ]
      },
      { 
        name: "A152NJUHX8M2KZ", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 740, target: 0, unit: "" },
          { name: "DCR", value: 97.24, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 4054, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.84, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 9.09, target: 98, unit: "%", status: "poor" }
        ]
      }
    ],
    recommendedFocusAreas: [
      "Delivered Not Received (DNR DPMO)",
      "Delivery Completion Rate (DCR)",
      "Contact Compliance"
    ]
  };
};

// Helper function to get the data (either real or dummy)
export const getScorecardData = (scorecardData: ScoreCardData | null): ScoreCardData => {
  return scorecardData || getDummyScoreCardData();
};
