
import { Employee } from "@/types/employee";

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
        
        // Split into rows and skip header row
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(header => 
          header.replace(/"/g, '').trim()
        );
        
        // Validate headers (minimal validation)
        const requiredFields = ['Name', 'Email', 'Telefon', 'Status', 'Transporter ID'];
        const hasAllRequiredFields = requiredFields.every(field => 
          headers.some(header => header.includes(field))
        );
        
        if (!hasAllRequiredFields) {
          reject(new Error('CSV-Datei fehlen erforderliche Spalten'));
          return;
        }
        
        // Parse data rows
        const employees: Employee[] = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty rows
          
          // Split by comma but respect quoted values
          let rowData: string[] = [];
          let inQuotes = false;
          let currentValue = '';
          
          for (let j = 0; j < rows[i].length; j++) {
            const char = rows[i][j];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              rowData.push(currentValue.replace(/"/g, ''));
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          
          // Add the last value
          if (currentValue) {
            rowData.push(currentValue.replace(/"/g, ''));
          }
          
          if (rowData.length < 5) continue; // Skip invalid rows
          
          // Get column indices
          const nameIndex = headers.findIndex(h => h.includes('Name') && !h.includes('Mentor'));
          const emailIndex = headers.findIndex(h => h.includes('Email'));
          const phoneIndex = headers.findIndex(h => h.includes('Telefon'));
          const statusIndex = headers.findIndex(h => h.includes('Status'));
          const transporterIdIndex = headers.findIndex(h => h.includes('Transporter ID'));
          const startDateIndex = headers.findIndex(h => h.includes('Startdatum'));
          const endDateIndex = headers.findIndex(h => h.includes('Enddatum'));
          const addressIndex = headers.findIndex(h => h.includes('Adresse'));
          const telegramIndex = headers.findIndex(h => h.includes('Telegram'));
          const workingDaysAWeekIndex = headers.findIndex(h => h.includes('Arbeitstage pro Woche'));
          const preferredVehicleIndex = headers.findIndex(h => h.includes('Bevorzugtes Fahrzeug'));
          const preferredWorkingDaysIndex = headers.findIndex(h => h.includes('Bevorzugte Arbeitstage'));
          const wantsToWorkSixDaysIndex = headers.findIndex(h => h.includes('Möchte 6 Tage'));
          const isFlexibleIndex = headers.findIndex(h => h.includes('Arbeitstage flexibel'));
          const mentorFirstNameIndex = headers.findIndex(h => h.includes('Mentor Vorname'));
          const mentorLastNameIndex = headers.findIndex(h => h.includes('Mentor Nachname'));
          
          // Create employee object with required fields
          const employee: Employee = {
            id: `import-${Date.now()}-${i}`, // Generate a temporary ID
            name: nameIndex >= 0 ? rowData[nameIndex] : 'Unbekannt',
            email: emailIndex >= 0 ? rowData[emailIndex] : '',
            phone: phoneIndex >= 0 ? rowData[phoneIndex] : '',
            status: statusIndex >= 0 ? rowData[statusIndex] : 'Aktiv',
            transporterId: transporterIdIndex >= 0 ? rowData[transporterIdIndex] : '',
            startDate: startDateIndex >= 0 && rowData[startDateIndex] ? rowData[startDateIndex] : new Date().toISOString().split('T')[0],
            endDate: endDateIndex >= 0 && rowData[endDateIndex] ? rowData[endDateIndex] : null,
            address: addressIndex >= 0 ? rowData[addressIndex] : '',
            telegramUsername: telegramIndex >= 0 ? rowData[telegramIndex] : '',
            workingDaysAWeek: workingDaysAWeekIndex >= 0 && rowData[workingDaysAWeekIndex] ? parseInt(rowData[workingDaysAWeekIndex]) : 5,
            preferredVehicle: preferredVehicleIndex >= 0 ? rowData[preferredVehicleIndex] : '',
            preferredWorkingDays: preferredWorkingDaysIndex >= 0 && rowData[preferredWorkingDaysIndex] 
              ? rowData[preferredWorkingDaysIndex].split(',') 
              : ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
            wantsToWorkSixDays: wantsToWorkSixDaysIndex >= 0 ? rowData[wantsToWorkSixDaysIndex].includes('Ja') : false,
            isWorkingDaysFlexible: isFlexibleIndex >= 0 ? rowData[isFlexibleIndex].includes('Ja') : true,
            mentorFirstName: mentorFirstNameIndex >= 0 ? rowData[mentorFirstNameIndex] : undefined,
            mentorLastName: mentorLastNameIndex >= 0 ? rowData[mentorLastNameIndex] : undefined
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
