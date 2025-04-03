
/**
 * Informationen zur Kalenderwoche eines Berichts
 */
export interface WeekInfo {
  date: Date;
  reportDate: Date;
  weekNumber: number;
  year: number;
}

/**
 * Strukturierte Daten eines Fahrers aus dem Mentor-Programm
 */
export interface MentorDriverData {
  firstName: string;
  lastName: string;
  station: string;
  totalTrips: number;
  totalKm: number;
  totalHours: number | string;
  acceleration: string;
  braking: string;
  cornering: string;
  distraction: string;
  seatbelt: string;         // Seatbelt Rating
  speeding: string;         // Speeding Rating
  following: string;        // Following Distance Rating
  overallRating: string;    // Overall Rating / FICO Score
}

/**
 * Vollständiger Mentor-Bericht mit Metadaten und Fahrerdaten
 */
export interface MentorReport {
  weekNumber: number;
  year: number;
  reportDate: string;
  fileName: string;
  drivers: MentorDriverData[];
}
