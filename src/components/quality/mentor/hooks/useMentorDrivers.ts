
import { useMemo, useState, useEffect } from "react";
import { MentorDriverData } from "@/components/file-upload/processors/mentor/types";
import { Employee } from "@/types/employee";
import { loadFromStorage, STORAGE_KEYS } from "@/utils/storage";

interface MentorDriver extends MentorDriverData {
  employeeName: string;
  transporterId: string;
}

export interface MentorTableData {
  weekNumber: number;
  year: number;
  drivers: MentorDriverData[];
}

export const useMentorDrivers = (data: MentorTableData | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Lade Mitarbeiterdaten aus dem localStorage
  useEffect(() => {
    const loadedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
    setEmployees(loadedEmployees);
    console.log('Geladene Mitarbeiterdaten für Mentor-Matching:', loadedEmployees.length);
  }, []);

  const driversWithNames = useMemo(() => {
    if (!data?.drivers || !data.drivers.length) return [];
    
    console.log(`Verarbeite ${data.drivers.length} Fahrer für die Anzeige`);
    
    // Erstelle Maps für verschiedene Matching-Strategien
    const employeesByMentorName = new Map();
    const employeesByNameParts = new Map();
    
    employees.forEach(employee => {
      // Strategie 1: Matching über Mentor-Namen in Mitarbeiterprofil
      if (employee.mentorFirstName || employee.mentorLastName) {
        // Schlüssel basierend auf Mentor Vor- und Nachname
        const mentorKey = `${(employee.mentorFirstName || '').toLowerCase()}_${(employee.mentorLastName || '').toLowerCase()}`;
        employeesByMentorName.set(mentorKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
      }
      
      // Strategie 2: Parsen des employee.name-Felds
      const nameParts = employee.name.split(' ');
      if (nameParts.length >= 2) {
        const lastName = nameParts[nameParts.length - 1].toLowerCase();
        // Verschiedene Kombinationen für den Vornamen probieren
        const firstName = nameParts[0].toLowerCase();
        
        // Schlüssel für exakte Übereinstimmung
        const exactKey = `${firstName}_${lastName}`;
        employeesByNameParts.set(exactKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
        
        // Schlüssel für Teilübereinstimmung (nur erste 3 Zeichen des Vornamens)
        if (firstName.length > 2) {
          const partialKey = `${firstName.substring(0, 3)}_${lastName}`;
          employeesByNameParts.set(partialKey, {
            name: employee.name,
            transporterId: employee.transporterId
          });
        }
      }
    });
    
    console.log('Verfügbare Mitarbeiter für Matching:', employees.length);
    console.log('Mitarbeiter mit Mentor-Daten:', employeesByMentorName.size);
    console.log('Mitarbeiter mit Namen-Parsing:', employeesByNameParts.size);
    
    // Ordne Fahrer zu und führe Namensabgleich durch
    return data.drivers.map(driver => {
      // Erstelle die gleichen Schlüsselstrukturen für das Matching
      const mentorKey = `${(driver.firstName || '').toLowerCase()}_${(driver.lastName || '').toLowerCase()}`;
      const matchedEmployee = employeesByMentorName.get(mentorKey) || 
                              employeesByNameParts.get(mentorKey);
      
      // Erstelle eine zusammengesetzte Anzeige für den Namen
      const driverFullName = `${driver.firstName} ${driver.lastName}`.trim();
      
      return {
        ...driver,
        employeeName: matchedEmployee?.name || driverFullName,
        transporterId: matchedEmployee?.transporterId || ''
      };
    });
  }, [data, employees]);

  return {
    driversWithNames,
    hasData: !!(data && data.drivers && data.drivers.length > 0)
  };
};
