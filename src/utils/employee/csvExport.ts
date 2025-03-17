
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
    'Möchte 6 Tage arbeiten',
    'Arbeitstage flexibel'
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
    employee.wantsToWorkSixDays ? 'Ja' : 'Nein',
    employee.isWorkingDaysFlexible !== false ? 'Ja' : 'Nein'
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
