
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
    wantsToWorkSixDays: 'Nein',
    isWorkingDaysFlexible: 'Ja'
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
    'Möchte 6 Tage arbeiten',
    'Arbeitstage flexibel'
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
    sampleEmployee.wantsToWorkSixDays,
    sampleEmployee.isWorkingDaysFlexible
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
