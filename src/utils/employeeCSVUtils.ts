
import { Employee } from "@/types/employee";

/**
 * Exports employee data to a CSV file and triggers download
 */
export const exportEmployeesToCSV = (employees: Employee[], filename: string) => {
  // Define the columns for CSV export
  const headers = [
    'Name',
    'Email', 
    'Telefon',
    'Status', 
    'Transporter ID', 
    'Startdatum',
    'Enddatum',
    'Adresse',
    'Telegram Username',
    'Arbeitstage pro Woche',
    'Bevorzugtes Fahrzeug',
    'Bevorzugte Arbeitstage',
    'Möchte 6 Tage arbeiten'
  ];
  
  // Transform the employee data to CSV rows
  const rows = employees.map(employee => [
    employee.name,
    employee.email,
    employee.phone,
    employee.status,
    employee.transporterId,
    employee.startDate,
    employee.endDate || '',
    employee.address,
    employee.telegramUsername || '',
    employee.workingDaysAWeek.toString(),
    employee.preferredVehicle,
    employee.preferredWorkingDays.join(','),
    employee.wantsToWorkSixDays ? 'Ja' : 'Nein'
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create a Blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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
          const nameIndex = headers.findIndex(h => h.includes('Name'));
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

/**
 * Generates a sample CSV template for employee import
 */
export const generateEmployeeSampleCSV = () => {
  // Sample data for the template
  const sampleEmployee = {
    name: 'Max Mustermann',
    email: 'max.mustermann@beispiel.de',
    phone: '+49 123 4567890',
    status: 'Aktiv',
    transporterId: 'TR-001',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    address: 'Musterstraße 123, 12345 Berlin',
    telegramUsername: '@maxmuster',
    workingDaysAWeek: '5',
    preferredVehicle: 'VW Golf',
    preferredWorkingDays: 'Mo,Di,Mi,Do,Fr',
    wantsToWorkSixDays: 'Nein'
  };
  
  // Define the headers
  const headers = [
    'Name',
    'Email', 
    'Telefon',
    'Status', 
    'Transporter ID', 
    'Startdatum',
    'Enddatum',
    'Adresse',
    'Telegram Username',
    'Arbeitstage pro Woche',
    'Bevorzugtes Fahrzeug',
    'Bevorzugte Arbeitstage',
    'Möchte 6 Tage arbeiten'
  ];
  
  // Create a sample row
  const sampleRow = [
    sampleEmployee.name,
    sampleEmployee.email,
    sampleEmployee.phone,
    sampleEmployee.status,
    sampleEmployee.transporterId,
    sampleEmployee.startDate,
    sampleEmployee.endDate,
    sampleEmployee.address,
    sampleEmployee.telegramUsername,
    sampleEmployee.workingDaysAWeek,
    sampleEmployee.preferredVehicle,
    sampleEmployee.preferredWorkingDays,
    sampleEmployee.wantsToWorkSixDays
  ];
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    sampleRow.map(cell => `"${cell}"`).join(',')
  ].join('\n');
  
  // Create a Blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'mitarbeiter_vorlage.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
