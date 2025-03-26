
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
  telegramUsername: string;
  workingDaysAWeek: number;
  preferredVehicle: string;
  preferredWorkingDays: string[];
  wantsToWorkSixDays: boolean;
  isWorkingDaysFlexible: boolean;
  mentorFirstName?: string; // New field for Mentor's first name
  mentorLastName?: string;  // New field for Mentor's last name
}
