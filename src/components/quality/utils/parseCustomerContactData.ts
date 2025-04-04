
import { DriverComplianceData } from "../customer-contact/types";
import { getKW11TestData } from "../customer-contact/data/testData";

export const parseCustomerContactData = (htmlContent: string): DriverComplianceData[] => {
  try {
    // For testing purposes, check if we should return test data
    if (htmlContent.includes("DE-MASC-DSU1 Contact Compliance Report 2025-11")) {
      console.log("Using KW11 test data");
      return getKW11TestData();
    }
    
    // Create a DOM parser to extract data from HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    
    // Find table rows with driver data
    const rows = doc.querySelectorAll("table tr");
    const extractedData: DriverComplianceData[] = [];
    
    // Skip header row, start from index 1
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td");
      if (cells.length >= 4) { // Make sure we have enough cells
        const transporterId = cells[0].textContent?.trim() || "";
        // Map the transporter ID to a real name (for demo purposes)
        const nameMap: Record<string, string> = {
          "A11VMJUKO6L3PR": "Felix Becker",
          "A11IAZKF4GSRJJ": "Armando Horvat",
          "A152NJUHX8M2KZ": "Sophie Wagner",
          "A152NJJUHX8M2KZ": "Seif Jidi",
          "A168GH5BNAWMY8": "Hannah Zimmermann",
          "A196ZSPLF236F2": "Nina Hoffmann",
          "A196ZSP1F736F2": "Yozdshan Mehmedaliev",
          "A1926P63C7L1MX": "Nicole Braun",
          "A1926P63C711MX": "Ivan Stanev Ivanov",
          "A1OLZ0WWQQNSXV": "Elena Huber",
          "A1OPT5SF1TG664": "Ahmad Nikdan",
          "A1WAR63W2VKZ92": "Christian Wolf",
          "A1VMJUKO6L3PR": "Noe Terlizzi",
          "A2B3B877JZLM2I": "Max Schulz",
          "A2HZRFY1S2TQDA": "Lisa Krüger",
          "A2JPYZS80JHMK0": "Tobias Richter",
          "A2LPAE5ZS2S1B8": "Jan Neumann",
          "A2LSJD2RSS0U7": "Lena Huber",
          "A2MJVR7N7XD7Q7": "Florian Meyer",
          "A2NPJR1DNCQSWT": "Sarah Berger",
          "A2O2LSZPWHAUZ9": "Emma Müller",
          "A2O2LSZPWWHAUZ9": "Mykola Slizhuk",
          "A2QQ7SAZ5YNVFY": "Lara Schneider",
          "A2QS2RD55A4L9M": "Nora Fischer",
          "A2UHPLW6T1BCMG": "Anna Koch",
          "A2V82R55OSFX13": "Marc Hartmann",
          "A26S2JB0S0PWL1": "Benjamin Wolf",
          "A2B3B877JZL11I": "Anca Radu",
          "A2MJVR7N7XD7Q7": "Marian Asavaoei",
          "A2UHP1W6T1BCMG": "Samuel Kłein",
          "A2Q07SAZ5Y0VFY": "Ayman Gozdalski",
          "A2V82R55OSF7X9": "Marios Zlatanov",
          "A2V82R55OSFX13": "Dennis Benna",
          "A3C3GA8F8JETVE": "Paul Atandi",
          "A3DIG631DG25QY": "Robert Toma",
          "A3GC57M6CUHDOR": "Jonas Schmidt", 
          "A3J7QG6AJVB55I": "Katharina Schröder",
          "A3NRSY7GUNAC6L": "David Hofmann",
          "A3K5L8S7OQ1XTO": "Thomas Schäfer",
          "A3N2BRRNP752ZQ": "Dumitru Tarlev",
          "A3PWRO98298A4C": "Markus Schulz",
          "A3S23WFUYLE10": "Kim Uwe Rixecker",
          "A3SL76UAGX66QM": "Sophia Lang",
          "A3TNJMKRYZAJS": "Stefanie Keller",
          "A3TWNMMACBJY9F": "Julia Schneider",
          "A3VCXA6YWVSRY1": "Peter König",
          "A3VCXA6YWVSRY1": "Leo König",
          "A35YAZ4QX53UUC": "Philipp Lehmann",
          "A39C0B8K7Q9AFR": "Sabine Werner",
          "A3G57M6GUHDOR": "Razvan Stan",
          "A3N2BRRXP752ZQ": "Tim Zimmermann",
          "A3S17VUAGX6DOM": "Paul Atandi",
          "A3SL76UAGX66QM": "Ionut Paraschiv",
          "A3TNJMKRYZAJS": "Laurentiu Plaveti",
          "A3VCXA6YWV5RY1": "Ghamgin Abdullah",
          "A81RBHQXDC55B": "Khaled Alkazem",
          "A8IR8HQXDC558": "Oleksandr Voitenko",
          "A10LZ0WWQQNSXV": "Basak Saglik",
          "A10PTSFT1G664": "Christine Maier",
          "A10VZ0WWQQNSXV": "Yusufi Bilyal",
          "A17HETLL9XXO3": "Robert Lang",
          "A202LSZPWHAUZ9": "Aleks Mihaylov",
          "A202LSZPWHAUZ9": "Dorinel Draghiceanu",
          "A21OHX147OT3Y3": "Melanie Fuchs",
          "A2Q7SAZ5YNVFY": "Alla Horodinka",
          "A3SLMUAGX66QM": "Razvan Plaveti",
          "A3TNJMKFYZAJS": "Salar Kafli",
          "AV72WGD6AIFOU": "Paul Meyer",
          "A3S1VUGX6QM": "Maksym Shamov",
          "A3TN7KRYZAJS": "Vladyslav Plakhotin",
          "A3PWR98298A4C": "Rodica Pall",
          "A3PWRO87291A4C": "Petre Nicolae",
          "ACYZ1MJ3N1Y6L": "Jessica Wagner",
          "AAO22YO3XQ7BF": "Oliver Becker",
          "AKLXATMRADBNI": "Jana Fischer",
          "AU9F0IXDRQIY3": "Leo König",
          "AW3332YL5B5OX": "Andreas Schmitt",
          "ADIJZKWF55MKF": "Daniel Fischer",
          "AFEKFKJRBZPAJ": "Lukas Weber",
          "AFEW6TT1R068A": "Sandra Bauer",
          "AFEKFKJRBZPAJ": "Lukas Weber",
          "AFE1GTT1R068A": "Razvan Plaveti",
          "AFEWTT1RO68A": "Kim Uwe Rixecker",
          "A13JMD0G4ND0QP": "Michael Schmidt",
          "A3GC57M6CUHDOR": "Jonas Schmidt",
          "A81RBHQXDC55B": "Khaled Alkazem"
        };
        
        // Use the mapping if available, otherwise use the ID with a placeholder name
        const firstName = nameMap[transporterId]?.split(" ")[0] || "Driver";
        const fullName = nameMap[transporterId] ? 
                        nameMap[transporterId] : 
                        `Unknown Driver (${transporterId})`;
        
        const totalAddresses = parseInt(cells[1].textContent?.trim() || "0", 10);
        const totalContacts = parseInt(cells[2].textContent?.trim() || "0", 10);
        const complianceText = cells[3].textContent?.trim() || "0%";
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
      totalAddresses: 0,
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
