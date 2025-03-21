
import { ScorecardKPI } from "../../../types";

export const getCompanyKPIs = (): ScorecardKPI[] => {
  return [
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
  ];
};
