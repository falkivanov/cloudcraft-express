
/**
 * Informationen zur Kalenderwoche eines Berichts
 */
export interface WeekInfo {
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
  totalHours: string;
  acceleration: string;
  braking: string;
  cornering: string;
  distraction: string;
  // Neue Felder für die Spalten J,L,N,V
  seatbelt: string;         // Spalte J - Seatbelt Rating
  speeding: string;         // Spalte L - Speeding Rating
  following: string;        // Spalte N - Following Distance Rating
  overallRating: string;    // Spalte V - Overall Rating
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
