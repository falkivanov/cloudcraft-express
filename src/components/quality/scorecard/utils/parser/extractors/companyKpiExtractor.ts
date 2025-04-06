
import { CompanyKPI, CategoryType } from "../../../types";
import { determineStatus } from "../../helpers/statusHelper";

/**
 * Extract company KPIs from text content
 */
export function extractCompanyKPIs(text: string): CompanyKPI[] {
  const companyKPIs: CompanyKPI[] = [];
  
  // Sample KPIs for the various categories
  const safetyKPIs = [
    {
      name: "Safety Incidents",
      value: 0,
      target: 0,
      category: "safety" as CategoryType,
      unit: ""
    },
    {
      name: "Safety Score",
      value: 97.5,
      target: 95,
      category: "safety" as CategoryType,
      unit: "%"
    }
  ];
  
  const complianceKPIs = [
    {
      name: "Route Compliance",
      value: 98.2,
      target: 97,
      category: "compliance" as CategoryType,
      unit: "%"
    },
    {
      name: "Documentation Compliance",
      value: 94.5,
      target: 95,
      category: "compliance" as CategoryType,
      unit: "%"
    }
  ];
  
  const customerKPIs = [
    {
      name: "Customer Satisfaction",
      value: 92,
      target: 90,
      category: "customer" as CategoryType,
      unit: "%"
    },
    {
      name: "Delivery Quality",
      value: 96.5,
      target: 95,
      category: "customer" as CategoryType,
      unit: "%"
    }
  ];
  
  // Add status to each KPI
  const allCategoryKPIs = [...safetyKPIs, ...complianceKPIs, ...customerKPIs];
  
  for (const kpi of allCategoryKPIs) {
    companyKPIs.push({
      ...kpi,
      status: determineStatus(kpi.name, kpi.value)
    });
  }
  
  return companyKPIs;
}
