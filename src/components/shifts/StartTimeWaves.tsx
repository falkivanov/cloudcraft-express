
import React, { useState, useEffect } from "react";
import { Clock, Waves, X, Users } from "lucide-react";
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
  const [waves, setWaves] = useState<Array<{id: number, time: string, requestedCount: number}>>([
    { id: 1, time: "11:00", requestedCount: scheduledEmployees.length }
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
      
      // Add new wave with default requested count of 0
      setWaves([...waves, { id: newWaveId, time: "11:00", requestedCount: 0 }]);
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
      
      // Redistribute requested counts
      const removedWave = waves.find(w => w.id === waveId);
      if (removedWave) {
        const firstWave = filteredWaves[0];
        filteredWaves[0] = {
          ...firstWave,
          requestedCount: firstWave.requestedCount + removedWave.requestedCount
        };
      }
      
      applyWaveDistribution(filteredWaves);
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

  // Handle changing the requested count for a wave
  const handleRequestedCountChange = (waveId: number, newCount: number) => {
    // Don't allow negative numbers
    if (newCount < 0) newCount = 0;
    
    // Don't allow more than the total number of employees
    if (newCount > scheduledEmployees.length) newCount = scheduledEmployees.length;
    
    const updatedWaves = waves.map(w => 
      w.id === waveId ? { ...w, requestedCount: newCount } : w
    );
    
    // Ensure the total requested count doesn't exceed the total number of employees
    let totalRequestedCount = updatedWaves.reduce((sum, wave) => sum + wave.requestedCount, 0);
    
    if (totalRequestedCount > scheduledEmployees.length) {
      // Adjust other waves to make the total match the employee count
      for (let i = 0; i < updatedWaves.length; i++) {
        if (updatedWaves[i].id !== waveId && updatedWaves[i].requestedCount > 0) {
          const diff = totalRequestedCount - scheduledEmployees.length;
          const newRequestedCount = Math.max(0, updatedWaves[i].requestedCount - diff);
          updatedWaves[i].requestedCount = newRequestedCount;
          totalRequestedCount = updatedWaves.reduce((sum, wave) => sum + wave.requestedCount, 0);
          
          if (totalRequestedCount <= scheduledEmployees.length) break;
        }
      }
    }
    
    setWaves(updatedWaves);
    applyWaveDistribution(updatedWaves);
  };

  // Automatically distribute employees based on the requested count for each wave
  const applyWaveDistribution = (currentWaves = waves) => {
    // Create a copy of employees to distribute
    const employeesToDistribute = [...scheduledEmployees];
    const newAssignments: WaveAssignment[] = [];
    
    // First, distribute employees according to requested counts
    currentWaves.forEach(wave => {
      const waveEmployees = employeesToDistribute.splice(0, wave.requestedCount);
      
      waveEmployees.forEach(emp => {
        newAssignments.push({
          employeeId: emp.id,
          startTime: wave.time,
          waveNumber: wave.id
        });
      });
    });
    
    // If there are any remaining employees, assign them to the first wave
    if (employeesToDistribute.length > 0) {
      employeesToDistribute.forEach(emp => {
        newAssignments.push({
          employeeId: emp.id,
          startTime: currentWaves[0].time,
          waveNumber: currentWaves[0].id
        });
      });
    }
    
    setAssignments(newAssignments);
  };

  // Handle changing an employee's wave assignment manually
  const handleEmployeeWaveChange = (employeeId: string, waveId: number) => {
    const waveTime = waves.find(w => w.id === waveId)?.time || "11:00";
    
    // Get current wave assignment for this employee
    const currentAssignment = assignments.find(a => a.employeeId === employeeId);
    const currentWaveId = currentAssignment?.waveNumber;
    
    if (currentWaveId === waveId) return; // No change needed
    
    const updatedAssignments = assignments.map(a => 
      a.employeeId === employeeId 
        ? { ...a, waveNumber: waveId, startTime: waveTime } 
        : a
    );
    
    setAssignments(updatedAssignments);
    
    // Update the wave requested counts to reflect this manual change
    const updatedWaves = [...waves];
    
    // Decrement the count of the previous wave
    if (currentWaveId) {
      const prevWaveIndex = updatedWaves.findIndex(w => w.id === currentWaveId);
      if (prevWaveIndex >= 0 && updatedWaves[prevWaveIndex].requestedCount > 0) {
        updatedWaves[prevWaveIndex].requestedCount -= 1;
      }
    }
    
    // Increment the count of the new wave
    const newWaveIndex = updatedWaves.findIndex(w => w.id === waveId);
    if (newWaveIndex >= 0) {
      updatedWaves[newWaveIndex].requestedCount += 1;
    }
    
    setWaves(updatedWaves);
  };

  // Save the wave assignments
  const handleSaveAssignments = () => {
    onAssignWaves(assignments);
  };

  // Update assignments when scheduledEmployees changes
  useEffect(() => {
    if (scheduledEmployees.length > 0 && waves.length > 0) {
      // Ensure all employees have an assignment
      const currentEmployeeIds = assignments.map(a => a.employeeId);
      const missingEmployees = scheduledEmployees.filter(emp => !currentEmployeeIds.includes(emp.id));
      
      if (missingEmployees.length > 0) {
        const newAssignments = [...assignments];
        
        missingEmployees.forEach(emp => {
          newAssignments.push({
            employeeId: emp.id,
            startTime: waves[0].time,
            waveNumber: waves[0].id
          });
        });
        
        setAssignments(newAssignments);
      }
      
      // Check if we have any assignments for employees that no longer exist
      const extraAssignments = assignments.filter(
        a => !scheduledEmployees.some(emp => emp.id === a.employeeId)
      );
      
      if (extraAssignments.length > 0) {
        const updatedAssignments = assignments.filter(
          a => scheduledEmployees.some(emp => emp.id === a.employeeId)
        );
        
        setAssignments(updatedAssignments);
      }
      
      // Update the requestedCount of the first wave if needed
      if (waves.length === 1 && waves[0].requestedCount !== scheduledEmployees.length) {
        setWaves([{ ...waves[0], requestedCount: scheduledEmployees.length }]);
      }
    }
  }, [scheduledEmployees]);

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
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={scheduledEmployees.length}
                        value={wave.requestedCount}
                        onChange={(e) => handleRequestedCountChange(wave.id, parseInt(e.target.value) || 0)}
                        className="h-8 w-20"
                      />
                      <span className="text-sm text-muted-foreground">von {scheduledEmployees.length}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    {employeeCount} Mitarbeiter aktuell zugeordnet
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
