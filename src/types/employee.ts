
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
  telegramUsername: string; // New field for Telegram username
  workingDaysAWeek: number;
  preferredVehicle: string;
  preferredWorkingDays: string[];
  wantsToWorkSixDays: boolean;
  isWorkingDaysFlexible: boolean; // New field for flexibility
}
