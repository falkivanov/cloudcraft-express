import React, { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Clock, Users, Waves, X } from "lucide-react";
import StartTimeWaves from "./StartTimeWaves";
import { WaveAssignment } from "@/types/shift";

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
  
  const sortedWaves = Object.values(employeesByWave).sort((a, b) => 
    a.startTime.localeCompare(b.startTime) || a.waveNumber - b.waveNumber
  );
  
  const singleWave = sortedWaves.length === 1;
  
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
              
              {singleWave ? (
                <div className="border rounded-md p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Alle Mitarbeiter starten um {sortedWaves[0]?.startTime} Uhr</h3>
                    <div className="ml-auto bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{sortedWaves[0]?.employees.length} Mitarbeiter</span>
                    </div>
                  </div>
                  <ul className="divide-y">
                    {sortedWaves[0]?.employees.map((employee) => (
                      <li key={employee.id} className="py-2 flex justify-between">
                        <div>
                          <span className="font-medium">{employee.name}</span>
                          {employee.telegramUsername && (
                            <div className="text-sm text-blue-500">
                              @{employee.telegramUsername}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {employee.phone}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedWaves.map((wave, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <h3 className="font-medium">Welle {wave.waveNumber}: Start um {wave.startTime} Uhr</h3>
                        <div className="ml-auto bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{wave.employees.length} Mitarbeiter</span>
                        </div>
                      </div>
                      <ul className="divide-y">
                        {wave.employees.map((employee) => (
                          <li key={employee.id} className="py-2 flex justify-between">
                            <div>
                              <span className="font-medium">{employee.name}</span>
                              {employee.telegramUsername && (
                                <div className="text-sm text-blue-500">
                                  @{employee.telegramUsername}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {employee.phone}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NextDaySchedule;
