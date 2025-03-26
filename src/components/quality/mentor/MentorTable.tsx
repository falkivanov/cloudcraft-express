
import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initialEmployees } from "@/data/sampleEmployeeData";

interface MentorDriver {
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
  transporterId?: string;
}

interface MentorTableProps {
  data: {
    weekNumber: number;
    year: number;
    drivers: MentorDriver[];
  } | null;
}

const MentorTable: React.FC<MentorTableProps> = ({ data }) => {
  const driversWithNames = useMemo(() => {
    if (!data?.drivers) return [];
    
    // Create a map of transporterId to employee name
    const transporterIdToEmployee = new Map();
    initialEmployees.forEach(employee => {
      transporterIdToEmployee.set(employee.transporterId, {
        name: employee.name,
        mentorFirstName: employee.mentorFirstName,
        mentorLastName: employee.mentorLastName
      });
    });
    
    // Map drivers and replace transporter IDs with actual names
    return data.drivers.map(driver => {
      const employee = driver.transporterId ? 
        transporterIdToEmployee.get(driver.transporterId) : undefined;
      
      return {
        ...driver,
        employeeName: employee?.name || `${driver.firstName} ${driver.lastName}`,
        mentorFirstName: employee?.mentorFirstName,
        mentorLastName: employee?.mentorLastName
      };
    });
  }, [data]);

  if (!data || driversWithNames.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Keine Daten verfügbar
      </div>
    );
  }

  // Helper to get risk color
  const getRiskColor = (risk: string) => {
    if (risk.toLowerCase().includes("high")) {
      return "bg-red-50 text-red-700 font-medium";
    } 
    if (risk.toLowerCase().includes("medium")) {
      return "bg-amber-50 text-amber-700 font-medium";
    }
    return "bg-green-50 text-green-700 font-medium";
  };

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[180px]">Fahrer</TableHead>
            <TableHead>Station</TableHead>
            <TableHead className="text-right">Fahrten</TableHead>
            <TableHead className="text-right">Kilometer</TableHead>
            <TableHead className="text-right">Stunden</TableHead>
            <TableHead className="text-center">Beschleunigung</TableHead>
            <TableHead className="text-center">Bremsen</TableHead>
            <TableHead className="text-center">Kurven</TableHead>
            <TableHead className="text-center">Ablenkung</TableHead>
            <TableHead>Mentor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {driversWithNames.map((driver, index) => (
            <TableRow key={index} className="hover:bg-slate-50">
              <TableCell className="font-medium">{driver.employeeName}</TableCell>
              <TableCell>{driver.station}</TableCell>
              <TableCell className="text-right">{driver.totalTrips}</TableCell>
              <TableCell className="text-right">{driver.totalKm}</TableCell>
              <TableCell className="text-right">{driver.totalHours}</TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.acceleration)}`}>
                {driver.acceleration}
              </TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.braking)}`}>
                {driver.braking}
              </TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.cornering)}`}>
                {driver.cornering}
              </TableCell>
              <TableCell className={`text-center ${getRiskColor(driver.distraction)}`}>
                {driver.distraction}
              </TableCell>
              <TableCell>
                {driver.mentorFirstName || driver.mentorLastName ? 
                  `${driver.mentorFirstName || ''} ${driver.mentorLastName || ''}`.trim() : 
                  '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MentorTable;
