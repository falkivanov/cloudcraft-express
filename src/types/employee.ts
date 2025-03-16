
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  transporterId: string;
  startDate: string;
  endDate: string | null;
  address: string;
  birthday: string;
  taxId: string;
  insuranceId: string;
  workingDaysAWeek: number;
  preferredVehicle: string;
  preferredWorkingDays: string[]; // Neue Eigenschaft: Präferierte Arbeitstage
  wantsToWorkSixDays: boolean;   // Neue Eigenschaft: Möchte 6 Tage arbeiten
}
