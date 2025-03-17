
import React, { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StartTimeWaves from "./StartTimeWaves";
import { WaveAssignment } from "./types/wave-types";
import { Clock, Users } from "lucide-react";
import { groupEmployeesByWave, getSortedWaves, isSingleWave } from "./utils/wave-utils";
import WaveEmployeeDisplay from "./wave-display/WaveEmployeeDisplay";

interface NextDaySchedulePageProps {
  scheduledEmployees: Employee[];
  date: Date;
}

const NextDaySchedulePage: React.FC<NextDaySchedulePageProps> = ({ 
  scheduledEmployees, 
  date
}) => {
  const formattedDate = format(date, "EEEE, dd.MM.yyyy", { locale: de });
  const [waveAssignments, setWaveAssignments] = useState<WaveAssignment[]>(
    scheduledEmployees.map(emp => ({
      employeeId: emp.id,
      startTime: "11:00",
      waveNumber: 1
    }))
  );
  
  // Group employees by wave using our utility functions
  const employeesByWave = groupEmployeesByWave(waveAssignments, scheduledEmployees);
  const sortedWaves = getSortedWaves(employeesByWave);
  const singleWave = isSingleWave(sortedWaves);
  
  // Handle wave assignments
  const handleAssignWaves = (assignments: WaveAssignment[]) => {
    setWaveAssignments(assignments);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Einsatzplan für {formattedDate}
        </h2>
        <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
          {scheduledEmployees.length} Mitarbeiter eingeplant
        </div>
      </div>

      {scheduledEmployees.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-lg">Keine Mitarbeiter für diesen Tag eingeplant.</p>
        </div>
      ) : (
        <>
          <StartTimeWaves 
            scheduledEmployees={scheduledEmployees}
            onAssignWaves={handleAssignWaves}
          />
          
          <WaveEmployeeDisplay 
            sortedWaves={sortedWaves}
            isSingleWave={singleWave}
          />
        </>
      )}
    </div>
  );
};

export default NextDaySchedulePage;
