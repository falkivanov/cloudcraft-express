
import { Vehicle } from "@/types/vehicle";

/**
 * Exports vehicle data to a CSV file and triggers download
 */
export const exportToCSV = (vehicles: Vehicle[], filename: string) => {
  // Define the columns for CSV export
  const headers = [
    'Kennzeichen', 
    'Marke', 
    'Modell', 
    'Fahrgestellnummer', 
    'Status', 
    'Datum Einflottung', 
    'Datum Ausflottung'
  ];
  
  // Transform the vehicle data to CSV rows
  const rows = vehicles.map(vehicle => [
    vehicle.licensePlate,
    vehicle.brand,
    vehicle.model,
    vehicle.vinNumber,
    vehicle.status,
    vehicle.infleetDate,
    vehicle.defleetDate || ''
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
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
 * Parses a CSV file and returns an array of Vehicle objects
 */
export const parseCSVImport = (file: File): Promise<Vehicle[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        if (!csvContent) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        // Split into rows and skip header row
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',');
        
        // Validate headers
        const requiredFields = ['Kennzeichen', 'Marke', 'Modell', 'Fahrgestellnummer', 'Status'];
        const hasAllRequiredFields = requiredFields.every(field => 
          headers.includes(field)
        );
        
        if (!hasAllRequiredFields) {
          reject(new Error('CSV file is missing required columns'));
          return;
        }
        
        // Parse data rows
        const vehicles: Vehicle[] = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty rows
          
          const rowData = rows[i].split(',');
          if (rowData.length < 5) continue; // Skip invalid rows
          
          // Get column indices
          const licensePlateIndex = headers.indexOf('Kennzeichen');
          const brandIndex = headers.indexOf('Marke');
          const modelIndex = headers.indexOf('Modell');
          const vinIndex = headers.indexOf('Fahrgestellnummer');
          const statusIndex = headers.indexOf('Status');
          const infleetDateIndex = headers.indexOf('Datum Einflottung');
          const defleetDateIndex = headers.indexOf('Datum Ausflottung');
          
          // Validate status
          const status = rowData[statusIndex];
          if (!['Aktiv', 'In Werkstatt', 'Defleet'].includes(status)) {
            continue; // Skip rows with invalid status
          }
          
          // Create vehicle object
          const vehicle: Vehicle = {
            id: `import-${Date.now()}-${i}`, // Generate a temporary ID
            licensePlate: rowData[licensePlateIndex],
            brand: rowData[brandIndex],
            model: rowData[modelIndex],
            vinNumber: rowData[vinIndex],
            status: status as 'Aktiv' | 'In Werkstatt' | 'Defleet',
            infleetDate: rowData[infleetDateIndex] || new Date().toISOString().split('T')[0],
            defleetDate: status === 'Defleet' && defleetDateIndex >= 0 ? rowData[defleetDateIndex] || null : null,
            repairs: [],
            appointments: []
          };
          
          vehicles.push(vehicle);
        }
        
        resolve(vehicles);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
