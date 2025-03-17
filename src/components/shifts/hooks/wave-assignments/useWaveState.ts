
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { Wave } from "../../types/wave-types";
import { WaveState } from "./types";

export const useWaveState = (scheduledEmployees: Employee[]) => {
  const [waveState, setWaveState] = useState<WaveState>({
    waveCount: 1,
    waves: [
      { id: 1, time: "11:00", requestedCount: scheduledEmployees.length }
    ]
  });

  // Update wave state
  const setWaves = (waves: Wave[]) => {
    setWaveState(prev => ({
      ...prev,
      waves
    }));
  };

  // Update wave count
  const setWaveCount = (waveCount: number) => {
    setWaveState(prev => ({
      ...prev,
      waveCount
    }));
  };

  // Add a new wave
  const handleAddWave = () => {
    if (waveState.waveCount < 3) {
      const newWaveId = waveState.waveCount + 1;
      setWaveCount(newWaveId);
      
      // Add new wave with default requested count of 0
      setWaves([...waveState.waves, { id: newWaveId, time: "11:00", requestedCount: 0 }]);
    }
  };

  // Remove a wave
  const handleRemoveWave = (waveId: number, redistributeEmployees: (waves: Wave[]) => void) => {
    if (waveState.waveCount > 1) {
      const filteredWaves = waveState.waves.filter(w => w.id !== waveId);
      setWaves(filteredWaves);
      setWaveCount(waveState.waveCount - 1);
      
      // Redistribute requested counts
      const removedWave = waveState.waves.find(w => w.id === waveId);
      if (removedWave) {
        const firstWave = filteredWaves[0];
        filteredWaves[0] = {
          ...firstWave,
          requestedCount: firstWave.requestedCount + removedWave.requestedCount
        };
      }
      
      // Apply the wave distribution
      redistributeEmployees(filteredWaves);
    }
  };

  // Change time for a wave
  const handleWaveTimeChange = (waveId: number, newTime: string, updateAssignmentTimes: (waveId: number, newTime: string) => void) => {
    const updatedWaves = waveState.waves.map(w => 
      w.id === waveId ? { ...w, time: newTime } : w
    );
    setWaves(updatedWaves);
    
    // Update all assignments for this wave with the new time
    updateAssignmentTimes(waveId, newTime);
  };

  // Change requested count for a wave
  const handleRequestedCountChange = (
    waveId: number, 
    newCount: number, 
    redistributeEmployees: (waves: Wave[]) => void
  ) => {
    // Don't allow negative numbers
    if (newCount < 0) newCount = 0;
    
    // Don't allow more than the total number of employees
    if (newCount > scheduledEmployees.length) newCount = scheduledEmployees.length;
    
    const updatedWaves = waveState.waves.map(w => 
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
    
    // Distribute the employees based on the new counts
    redistributeEmployees(updatedWaves);
  };

  // Update the first wave count when employees change
  useEffect(() => {
    if (waveState.waves.length === 1 && waveState.waves[0].requestedCount !== scheduledEmployees.length) {
      setWaves([{ ...waveState.waves[0], requestedCount: scheduledEmployees.length }]);
    }
  }, [scheduledEmployees.length]);

  return {
    waves: waveState.waves,
    waveCount: waveState.waveCount,
    setWaves,
    setWaveCount,
    handleAddWave,
    handleRemoveWave,
    handleWaveTimeChange,
    handleRequestedCountChange
  };
};
