
import { ScoreCardData } from "../../types";

// Get data for KW 9 2025
export const getWeek9Data = (): ScoreCardData => {
  return {
    week: 9,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 68.84,
    overallStatus: "Great",
    rank: 6,
    rankNote: "0 WoW",
    companyKPIs: [
      // Safety KPIs
      { name: "Vehicle Audit (VSA) Compliance", value: 98.04, target: 98, unit: "%", trend: "up", status: "fantastic" },
      { name: "Safe Driving Metric (FICO)", value: 800, target: 800, unit: "", trend: "up", status: "fantastic" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 8, target: 10, unit: "", trend: "down", status: "fantastic" },
      { name: "Mentor Adoption Rate", value: 86.54, target: 80, unit: "%", trend: "up", status: "fantastic" },
      
      // Compliance KPIs
      { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none" },
      { name: "Working Hours Compliance (WHC)", value: 95.65, target: 100, unit: "%", trend: "up", status: "fair" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance" },
      
      // Customer Experience KPIs
      { name: "Customer escalation DPMO", value: 61, target: 0, unit: "", trend: "down", status: "great" },
      { name: "Customer Delivery Feedback", value: 95.04, target: 85, unit: "%", trend: "up", status: "fantastic" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.16, target: 99, unit: "%", trend: "up", status: "fair" },
      { name: "Delivered Not Received (DNR DPMO)", value: 2220, target: 1100, unit: "", trend: "down", status: "poor" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.17, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 86.95, target: 98, unit: "%", trend: "up", status: "poor" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 97.16, target: 100, unit: "%", trend: "up", status: "great" },
    ],
    driverKPIs: [
      { 
        name: "A10PTFSFT1G664", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1324, target: 0, unit: "" },
          { name: "DCR", value: 99.7, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "" },
          { name: "POD", value: 99.29, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 88.24, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 100, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A13JMDQG4NDQQP", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1290, target: 0, unit: "" },
          { name: "DCR", value: 99.69, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 775, target: 1100, unit: "" },
          { name: "POD", value: 98.06, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 83.33, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 100, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A152NJUHX8M2KZ", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 272, target: 0, unit: "" },
          { name: "DCR", value: 98.91, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 3676, target: 1100, unit: "" },
          { name: "POD", value: 100, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 13.33, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 91.4, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A17HETJLL9XXO3", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1185, target: 0, unit: "" },
          { name: "DCR", value: 96.34, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 10127, target: 1100, unit: "" },
          { name: "POD", value: 83.33, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 13.33, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 97.11, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A187Y9WO4CHIBQ", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 272, target: 0, unit: "" },
          { name: "DCR", value: 97.14, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 7353, target: 1100, unit: "" },
          { name: "POD", value: 100, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 0, target: 98, unit: "%" },
          { name: "CE", value: 1, target: 0, unit: "" },
          { name: "DEX", value: 82.8, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A1926P63C7L1MX", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1151, target: 0, unit: "" },
          { name: "DCR", value: 96.4, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 5213, target: 1100, unit: "" },
          { name: "POD", value: 100, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 70, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 90.11, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A196ZSPLF236F2", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1277, target: 0, unit: "" },
          { name: "DCR", value: 96.96, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 4699, target: 1100, unit: "" },
          { name: "POD", value: 100, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 10.53, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 90.58, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A1IVMJUKO6L3PR", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1230, target: 0, unit: "" },
          { name: "DCR", value: 96.02, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 5691, target: 1100, unit: "" },
          { name: "POD", value: 98.08, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 71.05, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 91.68, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A1OLZOWWOQNSXV", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1297, target: 0, unit: "" },
          { name: "DCR", value: 99.85, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 1542, target: 1100, unit: "" },
          { name: "POD", value: 100, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 96.85, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A1ON8EOODQH8PK", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1362, target: 0, unit: "" },
          { name: "DCR", value: 99.85, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 734, target: 1100, unit: "" },
          { name: "POD", value: 100, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 94.65, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A1WAR63W2VKZ92", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1054, target: 0, unit: "" },
          { name: "DCR", value: 99.53, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "" },
          { name: "POD", value: 95.8, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 92.12, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A210HYCUI5QEHH", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1469, target: 0, unit: "" },
          { name: "DCR", value: 99.26, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 3404, target: 1100, unit: "" },
          { name: "POD", value: 99.51, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 100, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A210HXI470T3Y3", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1194, target: 0, unit: "" },
          { name: "DCR", value: 91.21, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 838, target: 1100, unit: "" },
          { name: "POD", value: 78, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 96.09, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 100, target: 85, unit: "%" }
        ]
      },
      // Continue with more drivers...
      { 
        name: "A2B3B877JZLM2I", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1247, target: 0, unit: "" },
          { name: "DCR", value: 99.05, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 1604, target: 1100, unit: "" },
          { name: "POD", value: 97.18, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 97.16, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A2HZRFY1S2TQDA", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1005, target: 0, unit: "" },
          { name: "DCR", value: 96.17, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "" },
          { name: "POD", value: 100, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 88.57, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 90.57, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A2JPYZS8JHMK0", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 766, target: 0, unit: "" },
          { name: "DCR", value: 98.46, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 1305, target: 1100, unit: "" },
          { name: "POD", value: 100, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 45.45, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 100, target: 85, unit: "%" }
        ]
      },
      { 
        name: "A2LPAESZS251B8", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1348, target: 0, unit: "" },
          { name: "DCR", value: 96.56, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "" },
          { name: "POD", value: 100, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 75, target: 98, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 94.48, target: 85, unit: "%" }
        ]
      }
      // ... adding a subset for brevity. In a real implementation, all drivers would be added.
    ],
    recommendedFocusAreas: [
      "Delivered Not Received (DNR DPMO)",
      "Contact Compliance",
      "Delivery Completion Rate (DCR)"
    ],
    sectionRatings: {
      complianceAndSafety: "Fantastic",
      qualityAndSWC: "Poor",
      capacity: "Great"
    },
    currentWeekTips: "Coming Soon"
  };
};
