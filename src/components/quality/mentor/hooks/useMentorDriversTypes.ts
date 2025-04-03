
import { MentorDriverData } from "@/components/file-upload/processors/mentor/types";

export interface MentorDriver extends MentorDriverData {
  employeeName?: string;
  transporterId?: string;
}

export interface MentorTableData {
  weekNumber: number;
  year: number;
  drivers: MentorDriverData[];
}

export type SortField = 
  | "firstName" 
  | "lastName" 
  | "overallRating" 
  | "station" 
  | "totalTrips" 
  | "totalKm" 
  | "totalHours" 
  | "acceleration" 
  | "braking" 
  | "cornering" 
  | "speeding" 
  | "tempo";

