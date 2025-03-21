import { ScoreCardData } from "../../types";

// Get data for KW 8 2025
export const getWeek8Data = (): ScoreCardData => {
  return {
    week: 8,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 72.44,
    overallStatus: "Great",
    rank: 6,
    rankNote: "-1 WoW",
    companyKPIs: [
      // Safety KPIs
      { name: "Vehicle Audit (VSA) Compliance", value: 100, target: 98, unit: "%", trend: "up", status: "fantastic" },
      { name: "Safe Driving Metric (FICO)", value: 790, target: 800, unit: "", trend: "up", status: "great" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 10, target: 10, unit: "", trend: "down", status: "fantastic" },
      { name: "Mentor Adoption Rate", value: 85.85, target: 80, unit: "%", trend: "up", status: "fantastic" },
      
      // Compliance KPIs
      { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none" },
      { name: "Working Hours Compliance (WHC)", value: 95.83, target: 100, unit: "%", trend: "up", status: "fair" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance" },
      
      // Customer Experience KPIs
      { name: "Customer escalation DPMO", value: 21, target: 0, unit: "", trend: "down", status: "great" },
      { name: "Customer Delivery Feedback", value: 95.41, target: 85, unit: "%", trend: "up", status: "fantastic" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.35, target: 99, unit: "%", trend: "up", status: "fair" },
      { name: "Delivered Not Received (DNR DPMO)", value: 2067, target: 1100, unit: "", trend: "down", status: "poor" },
      { name: "Lost on Road (LoR) DPMO", value: 420, target: 350, unit: "", trend: "down", status: "fair" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.85, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 86.52, target: 98, unit: "%", trend: "up", status: "poor" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 100, target: 100, unit: "%", trend: "up", status: "fantastic" },
      { name: "Next Day Capacity Reliability", value: 101.2, target: 100, unit: "%", trend: "up", status: "fantastic" },
    ],
    driverKPIs: [
      // Using placeholder driver data
      { 
        name: "A10PTFSFT1G664", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 995, target: 0, unit: "" },
          { name: "DCR", value: 98.35, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 2067, target: 1100, unit: "" },
          { name: "POD", value: 98.85, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 86.52, target: 98, unit: "%" },
          { name: "CE", value: 21, target: 0, unit: "" },
          { name: "DEX", value: 95.41, target: 85, unit: "%" }
        ]
      },
    ],
    recommendedFocusAreas: [
      "Delivered Not Received (DNR DPMO)",
      "Contact Compliance",
      "Delivery Completion Rate (DCR)"
    ],
    sectionRatings: {
      complianceAndSafety: "Fantastic",
      qualityAndSWC: "Fair",
      capacity: "Fantastic"
    },
    currentWeekTips: "Coming Soon"
  };
};
