
import React, { useState, useEffect } from "react";
import { Clock, Waves, X } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StartTimeWavesProps {
  scheduledEmployees: Employee[];
  onAssignWaves: (waveAssignments: WaveAssignment[]) => void;
}

export interface WaveAssignment {
  employeeId: string;
  startTime: string;
  waveNumber: number;
}

const StartTimeWaves: React.FC<StartTimeWavesProps> = ({ 
  scheduledEmployees,
  onAssignWaves
}) => {
  const [waveCount, setWaveCount] = useState<number>(1);
  const [waves, setWaves] = useState<Array<{id: number, time: string}>>([
    { id: 1, time: "11:00" }
  ]);
  const [assignments, setAssignments] = useState<WaveAssignment[]>(
    scheduledEmployees.map(emp => ({
      employeeId: emp.id,
      startTime: "11:00",
      waveNumber: 1
    }))
  );

  // Count employees per wave
  const employeesPerWave = waves.map(wave => {
    return {
      waveId: wave.id,
      count: assignments.filter(a => a.waveNumber === wave.id).length
    };
  });

  // Handle adding a new wave
  const handleAddWave = () => {
    if (waveCount < 3) {
      const newWaveId = waveCount + 1;
      setWaveCount(newWaveId);
      setWaves([...waves, { id: newWaveId, time: "11:00" }]);
    }
  };

  // Handle removing a wave
  const handleRemoveWave = (waveId: number) => {
    if (waveCount > 1) {
      const filteredWaves = waves.filter(w => w.id !== waveId);
      setWaves(filteredWaves);
      setWaveCount(waveCount - 1);
      
      // Reassign employees from removed wave to first wave
      const updatedAssignments = assignments.map(a => 
        a.waveNumber === waveId ? { ...a, waveNumber: 1, startTime: waves[0].time } : a
      );
      setAssignments(updatedAssignments);
    }
  };

  // Handle time change for a wave
  const handleWaveTimeChange = (waveId: number, newTime: string) => {
    const updatedWaves = waves.map(w => 
      w.id === waveId ? { ...w, time: newTime } : w
    );
    setWaves(updatedWaves);
    
    // Update all assignments for this wave with the new time
    const updatedAssignments = assignments.map(a => 
      a.waveNumber === waveId ? { ...a, startTime: newTime } : a
    );
    setAssignments(updatedAssignments);
  };

  // Handle changing an employee's wave assignment
  const handleEmployeeWaveChange = (employeeId: string, waveId: number) => {
    const waveTime = waves.find(w => w.id === waveId)?.time || "11:00";
    
    const updatedAssignments = assignments.map(a => 
      a.employeeId === employeeId 
        ? { ...a, waveNumber: waveId, startTime: waveTime } 
        : a
    );
    setAssignments(updatedAssignments);
  };

  // Save the wave assignments
  const handleSaveAssignments = () => {
    onAssignWaves(assignments);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="font-medium text-lg flex items-center gap-2">
            <Waves className="h-5 w-5 text-blue-500" />
            <span>Startzeitenwellen</span>
          </div>
          
          {waveCount < 3 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddWave}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              Welle hinzufügen
            </Button>
          )}
        </div>
        
        <div className="flex gap-3 mt-2">
          {waves.map((wave) => {
            const employeeCount = employeesPerWave.find(w => w.waveId === wave.id)?.count || 0;
            
            return (
              <Card key={wave.id} className="flex-1">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium flex items-center">
                      Welle {wave.id}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveWave(wave.id)}
                        className="h-6 w-6 p-0 ml-2 text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Input
                      type="time"
                      value={wave.time}
                      onChange={(e) => handleWaveTimeChange(wave.id, e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {employeeCount} Mitarbeiter zugeordnet
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Mitarbeiter den Wellen zuordnen</h3>
        <div className="space-y-2">
          {scheduledEmployees.map((employee) => {
            const assignment = assignments.find(a => a.employeeId === employee.id) || 
              { employeeId: employee.id, startTime: "11:00", waveNumber: 1 };
            
            return (
              <div key={employee.id} className="flex justify-between items-center p-2 border rounded-md">
                <div>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <Select 
                  value={assignment.waveNumber.toString()} 
                  onValueChange={(value) => handleEmployeeWaveChange(employee.id, parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Welle auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {waves.map((wave) => (
                      <SelectItem key={wave.id} value={wave.id.toString()}>
                        Welle {wave.id} - {wave.time} Uhr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={handleSaveAssignments}>
          Startzeitwellen speichern
        </Button>
      </div>
    </div>
  );
};

export default StartTimeWaves;
