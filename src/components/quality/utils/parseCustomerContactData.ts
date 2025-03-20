
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

// Helper function to calculate statistic summaries
export const calculateComplianceStatistics = (drivers: DriverComplianceData[]) => {
  if (drivers.length === 0) {
    return {
      averageCompliance: 0,
      totalDrivers: 0,
      criticalDrivers: 0,
      improvementDrivers: 0,
      goodDrivers: 0,
      totalContacts: 0,
      missedContacts: 0
    };
  }

  const totalDrivers = drivers.length;
  const sumCompliance = drivers.reduce((sum, driver) => sum + driver.compliancePercentage, 0);
  const averageCompliance = sumCompliance / totalDrivers;
  
  const criticalDrivers = drivers.filter(driver => driver.compliancePercentage < 85).length;
  const improvementDrivers = drivers.filter(driver => 
    driver.compliancePercentage >= 85 && driver.compliancePercentage < 98
  ).length;
  const goodDrivers = drivers.filter(driver => driver.compliancePercentage >= 98).length;
  
  const totalAddresses = drivers.reduce((sum, driver) => sum + driver.totalAddresses, 0);
  const totalContacts = drivers.reduce((sum, driver) => sum + driver.totalContacts, 0);
  const missedContacts = totalAddresses - totalContacts;
  
  return {
    averageCompliance,
    totalDrivers,
    criticalDrivers,
    improvementDrivers,
    goodDrivers,
    totalAddresses,
    totalContacts,
    missedContacts
  };
};
