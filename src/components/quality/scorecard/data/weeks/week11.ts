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
          { name: "DEX", value: 80.08, target: 95, unit: "%" }
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
      {
        name: "A19Z5PLPZ3GF2",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1016, target: 0, unit: "" },
          { name: "DCR", value: 98.33, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 81.82, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 82.86, target: 95, unit: "%" }
        ]
      },
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
        name: "A1KZDAUBMKKA8",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1178, target: 0, unit: "" },
          { name: "DCR", value: 99.92, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 1698, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 93.46, target: 95, unit: "%" }
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
      {
        name: "A1ON8E0DOQH8PK",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1406, target: 0, unit: "" },
          { name: "DCR", value: 99.58, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 3556, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 76.21, target: 95, unit: "%" }
        ]
      },
      {
        name: "A1WAR63W2VKZ92",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1159, target: 0, unit: "" },
          { name: "DCR", value: 98.89, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 2588, target: 1500, unit: "DPMO" },
          { name: "POD", value: 96.79, target: 98, unit: "%" },
          { name: "CC", value: 94.74, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 80.74, target: 95, unit: "%" }
        ]
      },
      {
        name: "A21QHX470T3Y3",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1208, target: 0, unit: "" },
          { name: "DCR", value: 97.42, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 91.45, target: 98, unit: "%" },
          { name: "CC", value: 97.78, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 93.73, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2652JBO5PWL1",
        status: "active",
        metrics: [
          { name: "Delivered", value: 181, target: 0, unit: "" },
          { name: "DCR", value: 99.45, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 16575, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 59.13, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2B3B877IZLM2I",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1293, target: 0, unit: "" },
          { name: "DCR", value: 99.16, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 95.33, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 83.58, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2HZRPY1S2TQDA",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1222, target: 0, unit: "" },
          { name: "DCR", value: 99.43, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 92, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 84.19, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2JPYZSBOIHMXU",
        status: "active",
        metrics: [
          { name: "Delivered", value: 936, target: 0, unit: "" },
          { name: "DCR", value: 98.01, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 1068, target: 1500, unit: "DPMO" },
          { name: "POD", value: 0, target: 98, unit: "%" },
          { name: "CC", value: 89.47, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 86.28, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2LPAESZS2S1B8",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1228, target: 0, unit: "" },
          { name: "DCR", value: 99.19, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 1629, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 91.67, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 85, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2LSIQZR5BSQU7",
        status: "active",
        metrics: [
          { name: "Delivered", value: 851, target: 0, unit: "" },
          { name: "DCR", value: 95.4, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 2350, target: 1500, unit: "DPMO" },
          { name: "POD", value: 92, target: 98, unit: "%" },
          { name: "CC", value: 94.59, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 85.36, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2MJVR7N7XD7Q7",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1191, target: 0, unit: "" },
          { name: "DCR", value: 98.35, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 97.14, target: 98, unit: "%" },
          { name: "CC", value: 95.45, target: 95, unit: "%" },
          { name: "CE", value: 1, target: 0, unit: "" },
          { name: "DEX", value: 80.47, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2NPJ81ONCQ3WT",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1174, target: 0, unit: "" },
          { name: "DCR", value: 99.16, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 92.82, target: 98, unit: "%" },
          { name: "CC", value: 99.34, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 89.86, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2Q2L5PWHIAJZ9",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1227, target: 0, unit: "" },
          { name: "DCR", value: 99.45, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 68.75, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 100, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2QS2RD55A4L9M",
        status: "active",
        metrics: [
          { name: "Delivered", value: 472, target: 0, unit: "" },
          { name: "DCR", value: 99.79, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 10593, target: 1500, unit: "DPMO" },
          { name: "POD", value: 97.59, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 60.2, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2QQT5A5ZSYNY6",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1030, target: 0, unit: "" },
          { name: "DCR", value: 96.9, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 971, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 95.32, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2UHPLWGT1BCMG",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1149, target: 0, unit: "" },
          { name: "DCR", value: 97.21, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 2611, target: 1500, unit: "DPMO" },
          { name: "POD", value: 99.66, target: 98, unit: "%" },
          { name: "CC", value: 86.02, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 90.94, target: 95, unit: "%" }
        ]
      },
      {
        name: "A2V82R55OSFXJ3",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1136, target: 0, unit: "" },
          { name: "DCR", value: 96.76, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 1761, target: 1500, unit: "DPMO" },
          { name: "POD", value: 90.91, target: 98, unit: "%" },
          { name: "CC", value: 98.72, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 87.82, target: 95, unit: "%" }
        ]
      },
      {
        name: "A35YA24QX53QUC",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1235, target: 0, unit: "" },
          { name: "DCR", value: 99.2, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 810, target: 1500, unit: "DPMO" },
          { name: "POD", value: 96.72, target: 98, unit: "%" },
          { name: "CC", value: 99.27, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 94, target: 95, unit: "%" }
        ]
      },
      {
        name: "A39C0B8K7Q9AFR",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1161, target: 0, unit: "" },
          { name: "DCR", value: 97.81, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 99.57, target: 98, unit: "%" },
          { name: "CC", value: 94.44, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 93.51, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3DIG631DG25QY",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1164, target: 0, unit: "" },
          { name: "DCR", value: 97.73, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 1718, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 98.71, target: 95, unit: "%" },
          { name: "CE", value: 1, target: 0, unit: "" },
          { name: "DEX", value: 72.92, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3E6DFN30CWSTJ",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1233, target: 0, unit: "" },
          { name: "DCR", value: 97.62, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 2433, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 93.57, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 82.52, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3GC57M6CUHDOR",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1225, target: 0, unit: "" },
          { name: "DCR", value: 100, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 816, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 78.38, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3J7QG6GAJMBSI",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1139, target: 0, unit: "" },
          { name: "DCR", value: 97.68, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 878, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 90.44, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 77.9, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3K5L857QQ1XTO",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1160, target: 0, unit: "" },
          { name: "DCR", value: 99.57, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 862, target: 1500, unit: "DPMO" },
          { name: "POD", value: 98.28, target: 98, unit: "%" },
          { name: "CC", value: 85.71, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 85.86, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3N2BRRNP75ZZQ",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1224, target: 0, unit: "" },
          { name: "DCR", value: 100, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 98.11, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 90.99, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3NR5Y7GUNAC6L",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1262, target: 0, unit: "" },
          { name: "DCR", value: 98.44, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 792, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 99.63, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 90.32, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3PWRO98298A4C",
        status: "active",
        metrics: [
          { name: "Delivered", value: 683, target: 0, unit: "" },
          { name: "DCR", value: 98.27, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 1464, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 87.5, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 91.55, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3SL7GUAG96GXM",
        status: "active",
        metrics: [
          { name: "Delivered", value: 237, target: 0, unit: "" },
          { name: "DCR", value: 99.58, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 68.4, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3TNJMKRYZYAJS",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1230, target: 0, unit: "" },
          { name: "DCR", value: 97.39, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 98.82, target: 98, unit: "%" },
          { name: "CC", value: 97.22, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 100, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3TWNMMAC9J79F",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1119, target: 0, unit: "" },
          { name: "DCR", value: 98.5, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 88.37, target: 98, unit: "%" },
          { name: "CC", value: 84.21, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 96.67, target: 95, unit: "%" }
        ]
      },
      {
        name: "A3VCXA6YWVSRY1",
        status: "active",
        metrics: [
          { name: "Delivered", value: 637, target: 0, unit: "" },
          { name: "DCR", value: 98.61, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 94.55, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 85.17, target: 95, unit: "%" }
        ]
      },
      {
        name: "A81B8HOXDC5SB",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1236, target: 0, unit: "" },
          { name: "DCR", value: 98.96, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 2427, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 71.86, target: 95, unit: "%" }
        ]
      },
      {
        name: "AAO22YQ3XQ7BF",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1149, target: 0, unit: "" },
          { name: "DCR", value: 99.39, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 99.6, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 93.99, target: 95, unit: "%" }
        ]
      },
      {
        name: "ACTZ1MJ3N1Y6L",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1238, target: 0, unit: "" },
          { name: "DCR", value: 98.57, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 808, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 90.38, target: 95, unit: "%" }
        ]
      },
      {
        name: "ADIZKWFSSMKF",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1023, target: 0, unit: "" },
          { name: "DCR", value: 98.55, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 978, target: 1500, unit: "DPMO" },
          { name: "POD", value: 97.78, target: 98, unit: "%" },
          { name: "CC", value: 72.73, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 76.02, target: 95, unit: "%" }
        ]
      },
      {
        name: "AFEKFKJRBZPAJ",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1176, target: 0, unit: "" },
          { name: "DCR", value: 96.31, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 31.58, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 89.87, target: 95, unit: "%" }
        ]
      },
      {
        name: "AFEWGTT1R068A",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1178, target: 0, unit: "" },
          { name: "DCR", value: 99.49, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 99.22, target: 98, unit: "%" },
          { name: "CC", value: 95.24, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 87.85, target: 95, unit: "%" }
        ]
      },
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
        name: "AU9F0IXDRQIY3",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1267, target: 0, unit: "" },
          { name: "DCR", value: 99.92, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 100, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 93.22, target: 95, unit: "%" }
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
      },
      {
        name: "AWS333Y1'5BSOX",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1158, target: 0, unit: "" },
          { name: "DCR", value: 96.02, target: 98.5, unit: "%" },
          { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO" },
          { name: "POD", value: 100, target: 98, unit: "%" },
          { name: "CC", value: 98.21, target: 95, unit: "%" },
          { name: "CE", value: 0, target: 0, unit: "" },
          { name: "DEX", value: 81.46, target: 95, unit: "%" }
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


