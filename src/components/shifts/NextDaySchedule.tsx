
import React, { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import StartTimeWaves from "./StartTimeWaves";
import { WaveAssignment } from "./types/wave-types";
import { groupEmployeesByWave, getSortedWaves, isSingleWave } from "./utils/wave-utils";
import WaveEmployeeDisplay from "./wave-display/WaveEmployeeDisplay";

interface NextDayScheduleProps {
  scheduledEmployees: Employee[];
  date: Date;
  onClose: () => void;
}

const NextDaySchedule: React.FC<NextDayScheduleProps> = ({ 
  scheduledEmployees, 
  date,
  onClose
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
  
  const handleAssignWaves = (assignments: WaveAssignment[]) => {
    setWaveAssignments(assignments);
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          Einsatzplan für {formattedDate}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {scheduledEmployees.length === 0 ? (
          <p className="text-muted-foreground">Keine Mitarbeiter eingeplant.</p>
        ) : (
          <>
            <StartTimeWaves 
              scheduledEmployees={scheduledEmployees}
              onAssignWaves={handleAssignWaves}
            />
            
            <div className="mt-6">
              <div className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {scheduledEmployees.length} Mitarbeiter nach Startwellen:
              </div>
              
              <WaveEmployeeDisplay 
                sortedWaves={sortedWaves} 
                isSingleWave={singleWave}
                cardTitle={null}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NextDaySchedule;
