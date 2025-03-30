
import { ScorecardKPI } from "../../../types";

export const getCompanyKPIs = (): ScorecardKPI[] => {
  return [
    // Safety KPIs
    { name: "Vehicle Audit (VSA) Compliance", value: 98.28, target: 98, unit: "%", trend: "up", status: "fantastic", category: "safety" },
    { name: "Safe Driving Metric (FICO)", value: 801, target: 800, unit: "", trend: "up", status: "fantastic", category: "safety" },
    { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic", category: "safety" },
    { name: "Speeding Event Rate (Per 100 Trips)", value: 5, target: 10, unit: "", trend: "down", status: "fantastic", category: "safety" },
    { name: "Mentor Adoption Rate", value: 85.39, target: 80, unit: "%", trend: "up", status: "fantastic", category: "safety" },
    
    // Compliance KPIs
    { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none", category: "compliance" },
    { name: "Working Hours Compliance (WHC)", value: 100, target: 100, unit: "%", trend: "up", status: "fantastic", category: "compliance" },
    { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance", category: "compliance" },
    
    // Customer Experience KPIs
    { name: "Customer escalation DPMO", value: 41, target: 50, unit: "DPMO", trend: "down", status: "great", category: "customer" },
    { name: "Customer Delivery Feedback", value: 85.43, target: 85, unit: "%", trend: "up", status: "fantastic", category: "customer" },
    
    // Quality KPIs
    { name: "Delivery Completion Rate (DCR)", value: 98.46, target: 99.0, unit: "%", trend: "up", status: "fair", category: "quality" },
    { name: "Delivered Not Received (DNR DPMO)", value: 1162, target: 1100, unit: "DPMO", trend: "down", status: "great", category: "quality" },
    { name: "Lost on Road (LoR) DPMO", value: 19, target: 350, unit: "DPMO", trend: "down", status: "fantastic", category: "quality" },
    
    // Standard Work Compliance
    { name: "Photo-On-Delivery", value: 98.52, target: 97.0, unit: "%", trend: "up", status: "fantastic", category: "standardWork" },
    { name: "Contact Compliance", value: 94.84, target: 98, unit: "%", trend: "up", status: "fair", category: "standardWork" },
    
    // Capacity KPIs
    { name: "Capacity Reliability", value: 99.5, target: 100, unit: "%", trend: "up", status: "great", category: "capacity" },
    { name: "Next Day Capacity Reliability", value: 99.5, target: 100, unit: "%", trend: "up", status: "great", category: "capacity" },
  ];
};
