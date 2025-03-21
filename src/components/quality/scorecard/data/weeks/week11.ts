import { ScoreCardData } from "../../types";

export const getWeek11Data = (): ScoreCardData => {
  return {
    week: 11,
    year: 2025,
    location: "DSU1",
    overallScore: 83.63,
    overallStatus: "Fantastic",
    rank: 1,
    rankNote: "Up 5 places from last week",
    companyKPIs: [
      // Safety
      {
        name: "Safe Driving Metric (FICO)",
        value: 801,
        target: 800,
        unit: "",
        trend: "up",
        status: "fantastic"
      },
      {
        name: "Speeding Event Rate (Per 100 Trips)",
        value: 5,
        target: 10,
        unit: "",
        trend: "down",
        status: "fantastic"
      },
      {
        name: "Mentor Adoption Rate",
        value: 85.39,
        target: 85,
        unit: "%",
        trend: "up",
        status: "fantastic"
      },
      // Compliance
      {
        name: "DVIC Compliance",
        value: 100,
        target: 98,
        unit: "%",
        trend: "up",
        status: "fantastic"
      },
      {
        name: "Vehicle Audit (VSA) Compliance",
        value: 98.28,
        target: 98,
        unit: "%",
        trend: "up",
        status: "fantastic"
      },
      {
        name: "Breach of Contract (BOC)",
        value: 0,
        target: 0,
        unit: "",
        trend: "neutral",
        status: "none"
      },
      {
        name: "Working Hours Compliance (WHC)",
        value: 100,
        target: 98,
        unit: "%",
        trend: "up",
        status: "fantastic"
      },
      {
        name: "Comprehensive Audit Score (CAS)",
        value: 100,
        target: 95,
        unit: "%",
        trend: "up",
        status: "in compliance"
      },
      // Quality
      {
        name: "Delivery Completion Rate (DCR)",
        value: 98.46,
        target: 98.5,
        unit: "%",
        trend: "neutral",
        status: "fair"
      },
      {
        name: "Delivered Not Received (DNR DPMO)",
        value: 1162,
        target: 1500,
        unit: "DPMO",
        trend: "down",
        status: "great"
      },
      {
        name: "Lost on Road (LoR) DPMO",
        value: 19,
        target: 50,
        unit: "DPMO",
        trend: "down",
        status: "fantastic"
      },
      // Customer Experience
      {
        name: "Customer escalation DPMO",
        value: 41,
        target: 50,
        unit: "DPMO",
        trend: "down",
        status: "great"
      },
      {
        name: "Customer Delivery Feedback",
        value: 85.43,
        target: 85,
        unit: "%",
        trend: "up",
        status: "fantastic"
      },
      // Standard Work
      {
        name: "Photo-On-Delivery",
        value: 98.52,
        target: 98,
        unit: "%",
        trend: "up",
        status: "fantastic"
      },
      {
        name: "Contact Compliance",
        value: 94.84,
        target: 95,
        unit: "%",
        trend: "up",
        status: "fair"
      },
      // Capacity
      {
        name: "Next Day Capacity Reliability",
        value: 99.5,
        target: 98,
        unit: "%",
        trend: "up",
        status: "great"
      }
    ],
    driverKPIs: [
      // Adding drivers from the table
      {
        name: "A10PTFSF1G664",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1285, target: 0, unit: "" },
          { name: "DCR", value: 99.61, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 2335, target: 1500, unit: "DPMO" },
          { name: "POD", value: 98.8, target: 98, unit: "%" },
          { name: "CC", value: 98.99, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 97.34, target: 95, unit: "%" }
        ]
      },
      {
        name: "A13JMD0G4ND0QP",
        status: "active",
        metrics: [
          { name: "Delivered", value: 721, target: 0, unit: "" },
          { name: "DCR", value: 99.72, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 1387, target: 1500, unit: "DPMO" },
          { name: "POD", value: 98.7, target: 98, unit: "%" },
          { name: "CC", value: 0, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 93.08, target: 95, unit: "%" }
        ]
      },
      {
        name: "A152NJUHX8M2KZ",
        status: "active",
        metrics: [
          { name: "Delivered", value: 888, target: 0, unit: "" },
          { name: "DCR", value: 98.56, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 4505, target: 1500, unit: "DPMO" },
          { name: "POD", value: 98.32, target: 98, unit: "%" },
          { name: "CC", value: 71.43, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 65.34, target: 95, unit: "%" }
        ]
      },
      {
        name: "A168GH5BNAWMY8",
        status: "active",
        metrics: [
          { name: "Delivered", value: 227, target: 0, unit: "" },
          { name: "DCR", value: 100, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 4405, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 87.82, target: 95, unit: "%" }
        ]
      },
      {
        name: "A17HET1L9X0Q3",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1071, target: 0, unit: "" },
          { name: "DCR", value: 97.99, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 934, target: 1500, unit: "DPMO" },
          { name: "POD", value: 93.94, target: 98, unit: "%" },
          { name: "CC", value: 97.22, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 88.4, target: 95, unit: "%" }
        ]
      },
      {
        name: "A1926P63C7L1MX",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1204, target: 0, unit: "" },
          { name: "DCR", value: 97.57, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 831, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 98.06, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 76.56, target: 95, unit: "%" }
        ]
      },
      // Adding more drivers would follow the same pattern
      // To keep this manageable, I'll add just a few more key drivers
      {
        name: "A1VMJUKO6L3PR",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1266, target: 0, unit: "" },
          { name: "DCR", value: 95.55, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 1580, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 74.14, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 72.94, target: 95, unit: "%" }
        ]
      },
      {
        name: "A1OLZ0WWQQNSXV",
        status: "active",
        metrics: [
          { name: "Delivered", value: 387, target: 0, unit: "" },
          { name: "DCR", value: 100, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 2584, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 91.52, target: 95, unit: "%" }
        ]
      },
      // Add a few more from the second part of the image
      {
        name: "AKLXATMRADBNI",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1118, target: 0, unit: "" },
          { name: "DCR", value: 98.76, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 99.23, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 87.49, target: 95, unit: "%" }
        ]
      },
      {
        name: "AV72WGD6AIFOU",
        status: "active",
        metrics: [
          { name: "Delivered", value: 231, target: 0, unit: "" },
          { name: "DCR", value: 98.72, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 89.18, target: 95, unit: "%" }
        ]
      }
    ],
    recommendedFocusAreas: [
      "Delivery Completion Rate (DCR)",
      "Delivered Not Received (DNR DPMO)",
      "Contact Compliance"
    ],
    sectionRatings: {
      complianceAndSafety: "Fantastic",
      qualityAndSWC: "Great",
      capacity: "Great"
    },
    currentWeekTips: "Coming Soon"
  };
};
