
import React, { useMemo, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loadFromStorage, STORAGE_KEYS } from "@/utils/storage";
import { Employee } from "@/types/employee";
import { MentorDriverData } from "@/components/file-upload/processors/mentor/types";
import { Badge } from "@/components/ui/badge";

interface MentorTableProps {
  data: {
    weekNumber: number;
    year: number;
    drivers: MentorDriverData[];
  } | null;
}

const MentorTable: React.FC<MentorTableProps> = ({ data }) => {
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

  if (!data || !data.drivers || data.drivers.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Keine Daten verfügbar
      </div>
    );
  }

  // Hilfsfunktion für Risiko-Farben
  const getRiskColor = (risk: string) => {
    if (!risk) return "";
    
    const lowerRisk = risk.toLowerCase();
    if (lowerRisk.includes("high")) {
      return "bg-red-50 text-red-700 font-medium";
    } 
    if (lowerRisk.includes("medium")) {
      return "bg-amber-50 text-amber-700 font-medium";
    }
    if (lowerRisk.includes("low")) {
      return "bg-green-50 text-green-700 font-medium";
    }
    // Fallback
    return "";
  };

  // FICO-Score formatieren und Farbe zuweisen
  const getScoreDisplay = (score: string) => {
    if (!score || score === "Unknown") return <span className="text-gray-500">-</span>;
    
    let numericScore = 0;
    // Versuche, einen nummerischen Wert zu extrahieren
    const matches = score.match(/\d+/);
    if (matches) {
      numericScore = parseInt(matches[0]);
    }
    
    // Wenn keine Zahl gefunden wurde, zeige den Original-Text an
    if (isNaN(numericScore)) return <span>{score}</span>;
    
    let color = "bg-red-100 text-red-800";
    if (numericScore >= 800) color = "bg-green-100 text-green-800";
    else if (numericScore >= 700) color = "bg-emerald-100 text-emerald-800";
    else if (numericScore >= 600) color = "bg-amber-100 text-amber-800";
    
    return (
      <Badge className={`${color} py-0.5 px-2`}>
        {numericScore}
      </Badge>
    );
  };

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[180px]">Fahrer</TableHead>
            <TableHead>Station</TableHead>
            <TableHead className="text-right">Fahrten</TableHead>
            <TableHead className="text-right">Stunden</TableHead>
            <TableHead className="text-center">Beschl.</TableHead>
            <TableHead className="text-center">Bremsen</TableHead>
            <TableHead className="text-center">Kurven</TableHead>
            <TableHead className="text-center">Ablenk.</TableHead>
            <TableHead className="text-center">Gurt</TableHead>
            <TableHead className="text-center">Tempo</TableHead>
            <TableHead className="text-center">Abstand</TableHead>
            <TableHead className="text-center">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {driversWithNames.map((driver, index) => (
            <TableRow key={index} className="hover:bg-slate-50">
              <TableCell className="font-medium">{driver.employeeName}</TableCell>
              <TableCell>{driver.station}</TableCell>
              <TableCell className="text-right">{driver.totalTrips}</TableCell>
              <TableCell className="text-right">{driver.totalHours}</TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.acceleration)}`}>
                {driver.acceleration || "-"}
              </TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.braking)}`}>
                {driver.braking || "-"}
              </TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.cornering)}`}>
                {driver.cornering || "-"}
              </TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.distraction)}`}>
                {driver.distraction || "-"}
              </TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.seatbelt)}`}>
                {driver.seatbelt || "-"}
              </TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.speeding)}`}>
                {driver.speeding || "-"}
              </TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.following)}`}>
                {driver.following || "-"}
              </TableCell>
              <TableCell className="text-center">
                {getScoreDisplay(driver.overallRating)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MentorTable;
