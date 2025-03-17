
import React, { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StartTimeWaves, { WaveAssignment } from "./StartTimeWaves";
import { Clock, Users } from "lucide-react";

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
  
  // Group employees by wave
  const employeesByWave = waveAssignments.reduce((groups, assignment) => {
    const { waveNumber, startTime, employeeId } = assignment;
    const waveKey = `${waveNumber}-${startTime}`;
    
    if (!groups[waveKey]) {
      groups[waveKey] = {
        waveNumber,
        startTime,
        employees: []
      };
    }
    
    const employee = scheduledEmployees.find(emp => emp.id === employeeId);
    if (employee) {
      groups[waveKey].employees.push(employee);
    }
    
    return groups;
  }, {} as Record<string, { waveNumber: number, startTime: string, employees: Employee[] }>);
  
  // Sort waves by time
  const sortedWaves = Object.values(employeesByWave).sort((a, b) => 
    a.startTime.localeCompare(b.startTime) || a.waveNumber - b.waveNumber
  );
  
  // Check if all employees are in the same wave
  const singleWave = sortedWaves.length === 1;
  
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
          
          <Card className="overflow-hidden mt-6">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="text-lg">
                {singleWave 
                  ? `Alle Mitarbeiter: Start um ${sortedWaves[0]?.startTime} Uhr` 
                  : `Eingeplante Mitarbeiter nach Startwellen`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {singleWave ? (
                <ul className="space-y-2">
                  {sortedWaves[0]?.employees.map((employee) => (
                    <li key={employee.id} className="py-2 border-b last:border-b-0">
                      {employee.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-4">
                  {sortedWaves.map((wave, index) => (
                    <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <h3 className="font-medium">Welle {wave.waveNumber}: Start um {wave.startTime} Uhr</h3>
                        <div className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          <Users className="inline h-3 w-3 mr-1" />
                          {wave.employees.length}
                        </div>
                      </div>
                      <ul className="space-y-1 pl-6">
                        {wave.employees.map((employee) => (
                          <li key={employee.id} className="py-1">
                            {employee.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default NextDaySchedulePage;
