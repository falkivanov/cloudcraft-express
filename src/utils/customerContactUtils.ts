
import { initialEmployees } from "@/data/sampleEmployeeData";

interface ContactReportData {
  transporterId: string;
  driverName: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  percentage: number;
}

export const parseCustomerContactReport = (htmlContent: string): ContactReportData[] => {
  // Create a temporary DOM element to parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  
  // Get all rows from the report table
  const rows = Array.from(doc.querySelectorAll("table tr")).slice(1); // Skip header row
  
  return rows.map(row => {
    const cells = Array.from(row.querySelectorAll("td"));
    if (cells.length < 4) return null;
    
    const transporterId = cells[0]?.textContent?.trim() || "";
    const totalAddresses = parseInt(cells[1]?.textContent?.trim() || "0", 10);
    const totalContacts = parseInt(cells[2]?.textContent?.trim() || "0", 10);
    const percentage = parseFloat(cells[3]?.textContent?.trim().replace("%", "") || "0");
    
    // Find the employee by transporterId
    const employee = initialEmployees.find(emp => emp.transporterId === transporterId);
    
    // Extract first name (assuming name format is "First Last")
    const firstName = employee?.name.split(" ")[0] || "";
    
    return {
      transporterId,
      driverName: employee?.name || transporterId, // Fall back to ID if name not found
      firstName,
      totalAddresses,
      totalContacts,
      percentage
    };
  }).filter(Boolean) as ContactReportData[];
};

export const generateDriverMessage = (data: ContactReportData): string => {
  if (data.percentage >= 98) return "";
  
  return `Hi ${data.firstName}, letzte Woche musstest du ${data.totalAddresses} Kunden kontaktiert, hast aber nur ${data.totalContacts} kontaktiert. Immer wenn du ein Paket nicht zustellen kannst musst du den Kunden anrufen oder eine SMS schreiben. Bitte versuch diese Woche auf 100% zu kommen.`;
};
