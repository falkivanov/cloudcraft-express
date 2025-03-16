
import { Employee } from "@/types/employee";
import { parseCSVContent, extractCSVHeaders, getColumnIndex, validateCSVHeaders } from "./csvParserUtils";

/**
 * Parses a CSV file and returns an array of Employee objects
 */
export const parseEmployeeCSVImport = (file: File): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        if (!csvContent) {
          reject(new Error('Datei konnte nicht gelesen werden'));
          return;
        }
        
        // Extract headers and validate
        const headers = extractCSVHeaders(csvContent);
        const requiredFields = ['Name', 'Email', 'Telefon', 'Status', 'Transporter ID'];
        
        if (!validateCSVHeaders(headers, requiredFields)) {
          reject(new Error('CSV-Datei fehlen erforderliche Spalten'));
          return;
        }
        
        // Parse all rows including headers
        const allRows = parseCSVContent(csvContent);
        
        // Skip header row and process data rows
        const dataRows = allRows.slice(1);
        const employees: Employee[] = [];
        
        // Get column indices for all fields
        const nameIndex = getColumnIndex(headers, 'Name');
        const emailIndex = getColumnIndex(headers, 'Email');
        const phoneIndex = getColumnIndex(headers, 'Telefon');
        const statusIndex = getColumnIndex(headers, 'Status');
        const transporterIdIndex = getColumnIndex(headers, 'Transporter ID');
        const startDateIndex = getColumnIndex(headers, 'Startdatum');
        const endDateIndex = getColumnIndex(headers, 'Enddatum');
        const addressIndex = getColumnIndex(headers, 'Adresse');
        const telegramIndex = getColumnIndex(headers, 'Telegram');
        const workingDaysAWeekIndex = getColumnIndex(headers, 'Arbeitstage pro Woche');
        const preferredVehicleIndex = getColumnIndex(headers, 'Bevorzugtes Fahrzeug');
        const preferredWorkingDaysIndex = getColumnIndex(headers, 'Bevorzugte Arbeitstage');
        const wantsToWorkSixDaysIndex = getColumnIndex(headers, 'Möchte 6 Tage');
        
        // Process each data row
        for (const rowData of dataRows) {
          if (rowData.length < 5) continue; // Skip invalid rows
          
          // Determine the status
          const status = statusIndex >= 0 ? rowData[statusIndex].trim() : 'Aktiv';
          
          // Determine the end date
          // If status is 'Aktiv', endDate should be null regardless of what's in the CSV
          const endDate = (statusIndex >= 0 && status.toLowerCase() === 'aktiv')
            ? null
            : (endDateIndex >= 0 && rowData[endDateIndex]?.trim()) 
              ? rowData[endDateIndex].trim() 
              : null;
          
          // Create employee object with required fields
          const employee: Employee = {
            id: `import-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate a unique ID
            name: nameIndex >= 0 ? rowData[nameIndex] : 'Unbekannt',
            email: emailIndex >= 0 ? rowData[emailIndex] : '',
            phone: phoneIndex >= 0 ? rowData[phoneIndex] : '',
            status: status, // Use the determined status
            transporterId: transporterIdIndex >= 0 ? rowData[transporterIdIndex] : '',
            startDate: startDateIndex >= 0 && rowData[startDateIndex] ? rowData[startDateIndex] : new Date().toISOString().split('T')[0],
            endDate: endDate, // Use the determined endDate
            address: addressIndex >= 0 ? rowData[addressIndex] : '',
            telegramUsername: telegramIndex >= 0 ? rowData[telegramIndex] : '',
            workingDaysAWeek: workingDaysAWeekIndex >= 0 && rowData[workingDaysAWeekIndex] ? parseInt(rowData[workingDaysAWeekIndex]) : 5,
            preferredVehicle: preferredVehicleIndex >= 0 ? rowData[preferredVehicleIndex] : '',
            preferredWorkingDays: preferredWorkingDaysIndex >= 0 && rowData[preferredWorkingDaysIndex] 
              ? rowData[preferredWorkingDaysIndex].split(',').map(day => day.trim())
              : ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
            wantsToWorkSixDays: wantsToWorkSixDaysIndex >= 0 ? rowData[wantsToWorkSixDaysIndex].toLowerCase().includes('ja') : false
          };
          
          employees.push(employee);
        }
        
        resolve(employees);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Datei konnte nicht gelesen werden'));
    };
    
    reader.readAsText(file);
  });
};
