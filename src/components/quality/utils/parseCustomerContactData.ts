
interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

export const parseCustomerContactData = (htmlContent: string): DriverComplianceData[] => {
  try {
    // Create a DOM parser to extract data from HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    
    // Find table rows with driver data
    const rows = doc.querySelectorAll("table tr");
    const extractedData: DriverComplianceData[] = [];
    
    // Skip header row, start from index 1
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td");
      if (cells.length >= 6) { // Make sure we have enough cells
        const fullName = cells[0].textContent?.trim() || "";
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] || "";
        const totalAddresses = parseInt(cells[1].textContent?.trim() || "0", 10);
        const totalContacts = parseInt(cells[2].textContent?.trim() || "0", 10);
        const complianceText = cells[5].textContent?.trim() || "0%";
        const compliancePercentage = parseFloat(complianceText.replace("%", ""));
        
        extractedData.push({
          name: fullName,
          firstName,
          totalAddresses,
          totalContacts,
          compliancePercentage
        });
      }
    }
    
    return extractedData;
  } catch (error) {
    console.error("Error parsing customer contact HTML:", error);
    return [];
  }
};
