
import { ScoreCardData } from "../../types";

// Data for Week 10 with complete driver data
export const getDummyScoreCardData = (): ScoreCardData => {
  return {
    week: 10,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 75.01,
    overallStatus: "Great",
    rank: 6,
    rankNote: "0 WoW",
    companyKPIs: [
      // Safety KPIs
      { name: "Vehicle Audit (VSA) Compliance", value: 97.92, target: 98, unit: "%", trend: "up", status: "great" },
      { name: "Safe Driving Metric (FICO)", value: 795, target: 800, unit: "", trend: "up", status: "great" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 8, target: 10, unit: "", trend: "down", status: "fantastic" },
      { name: "Mentor Adoption Rate", value: 85.64, target: 80, unit: "%", trend: "up", status: "fantastic" },
      
      // Compliance KPIs
      { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none" },
      { name: "Working Hours Compliance (WHC)", value: 100, target: 100, unit: "%", trend: "up", status: "fantastic" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance" },
      
      // Customer Experience KPIs
      { name: "Customer escalation DPMO", value: 40, target: 0, unit: "", trend: "down", status: "great" },
      { name: "Customer Delivery Feedback", value: 94.82, target: 85, unit: "%", trend: "up", status: "fantastic" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.32, target: 99, unit: "%", trend: "up", status: "fair" },
      { name: "Delivered Not Received (DNR DPMO)", value: 1939, target: 1100, unit: "", trend: "down", status: "poor" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.35, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 91.61, target: 98, unit: "%", trend: "up", status: "fair" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 100.51, target: 100, unit: "%", trend: "up", status: "fantastic" },
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
          { name: "Contact Compliance", value: 89.36, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 96.07, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A13IMDQG4NDQQP", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 995, target: 0, unit: "" },
          { name: "DCR", value: 99.8, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 2010, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.77, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 50, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 89.91, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A152NJUHX8M2KZ", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 740, target: 0, unit: "" },
          { name: "DCR", value: 97.24, target: 99, unit: "%", status: "poor" },
          { name: "DNR DPMO", value: 4054, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.84, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 9.09, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A17HETJL9XX03", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 590, target: 0, unit: "" },
          { name: "DCR", value: 97.52, target: 99, unit: "%", status: "poor" },
          { name: "DNR DPMO", value: 13559, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 93.94, target: 97, unit: "%", status: "poor" },
          { name: "Contact Compliance", value: 90.91, target: 98, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 81.01, target: 85, unit: "%", status: "fair" }
        ]
      },
      { 
        name: "A1926P63C7L1MX", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1124, target: 0, unit: "" },
          { name: "DCR", value: 96.4, target: 99, unit: "%", status: "poor" },
          { name: "DNR DPMO", value: 3559, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 82.41, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 86.11, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A196ZSPLF236F2", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1244, target: 0, unit: "" },
          { name: "DCR", value: 98.26, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 4019, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 78.95, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 95.02, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A1IVMJUKO6L3PR", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 396, target: 0, unit: "" },
          { name: "DCR", value: 93.4, target: 99, unit: "%", status: "poor" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 88, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 1, target: 0, unit: "", status: "fair" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A1KZDBMKKAI8", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1096, target: 0, unit: "" },
          { name: "DCR", value: 99.91, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 96.64, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A1OLZ0WWQQNSXV", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1235, target: 0, unit: "" },
          { name: "DCR", value: 99.28, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 3239, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 99.66, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 93.19, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A1ON8E0ODQH8PK", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1327, target: 0, unit: "" },
          { name: "DCR", value: 99.48, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 1507, target: 1100, unit: "", status: "fair" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 95.83, target: 98, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 97.44, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A1WAR63W2VKZ92", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1077, target: 0, unit: "" },
          { name: "DCR", value: 99.91, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 1857, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 95.42, target: 97, unit: "%", status: "fair" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A210HYCU5QEHH", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1129, target: 0, unit: "" },
          { name: "DCR", value: 97.58, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 1771, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 66.67, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 93.57, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A21OHXI47OT3Y3", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 981, target: 0, unit: "" },
          { name: "DCR", value: 93.25, target: 99, unit: "%", status: "poor" },
          { name: "DNR DPMO", value: 2039, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 92.31, target: 97, unit: "%", status: "poor" },
          { name: "Contact Compliance", value: 96.03, target: 98, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 94.04, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A26S2JB0S0PWL1", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 301, target: 0, unit: "" },
          { name: "DCR", value: 99.01, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 88.83, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2B3B877JZLM2I", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1285, target: 0, unit: "" },
          { name: "DCR", value: 99.38, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 778, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 96.27, target: 97, unit: "%", status: "fair" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 92.78, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2HZRFY1S2TQDA", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1172, target: 0, unit: "" },
          { name: "DCR", value: 97.67, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 90, target: 98, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 96.72, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2JPYZS80JHMK0", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 966, target: 0, unit: "" },
          { name: "DCR", value: 97.87, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 4141, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 88.38, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2LPAE5ZS2S1B8", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1239, target: 0, unit: "" },
          { name: "DCR", value: 99.04, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 807, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 90, target: 98, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 92.33, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2LSJD2RSBS0U7", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1160, target: 0, unit: "" },
          { name: "DCR", value: 97.23, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 862, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 94.12, target: 97, unit: "%", status: "fair" },
          { name: "Contact Compliance", value: 76.47, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 97.46, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2MJVR7N7XD7Q7", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1229, target: 0, unit: "" },
          { name: "DCR", value: 97.93, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 814, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 94.3, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2NPJB1DNCQSWT", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1280, target: 0, unit: "" },
          { name: "DCR", value: 98.54, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 92.68, target: 97, unit: "%", status: "poor" },
          { name: "Contact Compliance", value: 93.1, target: 98, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 97.98, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2O2LSZPWHAUZ9", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 979, target: 0, unit: "" },
          { name: "DCR", value: 98.89, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 3064, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 86.49, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2OS2RD55A4L9M", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 192, target: 0, unit: "" },
          { name: "DCR", value: 100, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 94.74, target: 97, unit: "%", status: "fair" },
          { name: "Contact Compliance", value: 0, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 0, target: 85, unit: "%", status: "poor" }
        ]
      },
      { 
        name: "A2OQ7SAZ5YNVFY", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 236, target: 0, unit: "" },
          { name: "DCR", value: 94.4, target: 99, unit: "%", status: "poor" },
          { name: "DNR DPMO", value: 16949, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 75, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 89.24, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2UHPLW6T1BCMG", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 991, target: 0, unit: "" },
          { name: "DCR", value: 99.3, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 4036, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 99.69, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 79.55, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 96.94, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A2V82R5SOSFX13", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 817, target: 0, unit: "" },
          { name: "DCR", value: 96.8, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 4896, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 81.2, target: 97, unit: "%", status: "poor" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 89.15, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A33NDC1MO27XMB", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1183, target: 0, unit: "" },
          { name: "DCR", value: 98.09, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 3381, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 99.33, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 98.46, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 97.02, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A35YA24QX53UUC", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 954, target: 0, unit: "" },
          { name: "DCR", value: 98.66, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 95.61, target: 97, unit: "%", status: "fair" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A39C0B8K7Q9AFR", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1026, target: 0, unit: "" },
          { name: "DCR", value: 97.62, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 83.72, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 93.76, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3DIG631DG25QY", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1176, target: 0, unit: "" },
          { name: "DCR", value: 96.08, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 850, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 76.77, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 92, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3E6DFN30CWSTJ", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 873, target: 0, unit: "" },
          { name: "DCR", value: 97.22, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 9164, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 94.97, target: 98, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3GC57MGcUHDQR", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1242, target: 0, unit: "" },
          { name: "DCR", value: 99.76, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 805, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 95.25, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3J7QG6AJVB55I", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1067, target: 0, unit: "" },
          { name: "DCR", value: 98.98, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 94, target: 98, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 95.28, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3K5L8S7OQ1XTO", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1185, target: 0, unit: "" },
          { name: "DCR", value: 99.83, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 2532, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 86.95, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3N2BRRNP752ZQ", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1208, target: 0, unit: "" },
          { name: "DCR", value: 99.67, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3NR5Y7GUNAC6L", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1202, target: 0, unit: "" },
          { name: "DCR", value: 99.09, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 832, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 94.89, target: 97, unit: "%", status: "fair" },
          { name: "Contact Compliance", value: 99.32, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 91.12, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3PWRO98298A4C", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 173, target: 0, unit: "" },
          { name: "DCR", value: 97.74, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 5780, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 97.67, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3TWNMMACBIY9F", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1023, target: 0, unit: "" },
          { name: "DCR", value: 99.32, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 1955, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 88.1, target: 97, unit: "%", status: "poor" },
          { name: "Contact Compliance", value: 89.66, target: 98, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 96.67, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A3VCXA6YWVSRY1", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 532, target: 0, unit: "" },
          { name: "DCR", value: 95.86, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 1880, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 77.36, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 95.49, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "A81RBHQXDC55B", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1263, target: 0, unit: "" },
          { name: "DCR", value: 99.21, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 1584, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 89.42, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "AAO22YO3XQ7BF", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1229, target: 0, unit: "" },
          { name: "DCR", value: 99.84, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 814, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 99.03, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 96.78, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "ACYZ1MJ3N1Y6L", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1224, target: 0, unit: "" },
          { name: "DCR", value: 98.79, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 80, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 94.73, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "ADJJZKWFS5MKF", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 871, target: 0, unit: "" },
          { name: "DCR", value: 98.98, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 2296, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 97.14, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 55.56, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 92.17, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "AFEW6TT1R068A", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 664, target: 0, unit: "" },
          { name: "DCR", value: 100, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 1506, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "AKLXATMRADBNI", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1165, target: 0, unit: "" },
          { name: "DCR", value: 96.76, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 99.08, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 98.9, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 97.64, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "AU9F0IXDRQIY3", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1177, target: 0, unit: "" },
          { name: "DCR", value: 99.83, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 100, target: 85, unit: "%", status: "fantastic" }
        ]
      },
      { 
        name: "AV72WGD6AIF0U", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 193, target: 0, unit: "" },
          { name: "DCR", value: 100, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 0, target: 1100, unit: "", status: "fantastic" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 100, target: 98, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 74.42, target: 85, unit: "%", status: "poor" }
        ]
      },
      { 
        name: "AW3332YL5B5OX", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 946, target: 0, unit: "" },
          { name: "DCR", value: 95.08, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 2114, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 100, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 78.57, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 0, target: 0, unit: "", status: "fantastic" },
          { name: "DEX", value: 97.24, target: 85, unit: "%", status: "fantastic" }
        ]
      }
    ],
    recommendedFocusAreas: [
      "Delivered Not Received (DNR DPMO)",
      "Delivery Completion Rate (DCR)",
      "Contact Compliance"
    ],
    sectionRatings: {
      complianceAndSafety: "Fantastic",
      qualityAndSWC: "Fair",
      capacity: "Fantastic"
    },
    currentWeekTips: "Coming Soon"
  };
};

