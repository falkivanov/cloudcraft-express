
/**
 * Types for Mentor data processing
 */

export interface MentorDriverData {
  firstName: string;
  lastName: string;
  station: string;
  totalTrips: number;
  totalKm: number;
  totalHours: string;
  acceleration: string;
  braking: string;
  cornering: string;
  distraction: string;
  transporterId?: string; // Added optional transporterId field
}

export interface MentorReport {
  weekNumber: number;
  year: number;
  reportDate: string;
  fileName: string;
  drivers: MentorDriverData[];
}

export interface WeekInfo {
  weekNumber: number;
  year: number;
}

export interface ProcessOptions {
  showToasts?: boolean;
}
