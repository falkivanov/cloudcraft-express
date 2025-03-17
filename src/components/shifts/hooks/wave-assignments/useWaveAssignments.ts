
import { Employee } from "@/types/employee";
import { useWaveState } from "./useWaveState";
import { useAssignments } from "./useAssignments";
import { useEmployeesPerWave } from "./useEmployeesPerWave";

export const useWaveAssignments = (scheduledEmployees: Employee[]) => {
  // Use our separated hooks
  const waveState = useWaveState(scheduledEmployees);
  const { 
    waves, 
    handleAddWave, 
    handleRemoveWave, 
    handleWaveTimeChange, 
    handleRequestedCountChange 
  } = waveState;

  const { 
    assignments, 
    applyWaveDistribution, 
    handleEmployeeWaveChange: handleEmployeeWaveChangeBase, 
    getEmployeeWaveId, 
    updateAssignmentTimes,
    reassignEmployeesFromWave
  } = useAssignments(scheduledEmployees, waves);

  const employeesPerWave = useEmployeesPerWave(waves, assignments);

  // Handle wave removal with appropriate reassignments
  const handleWaveRemoveWithReassignment = (waveId: number) => {
    // Before removing, reassign employees from this wave to the first wave
    if (waves.length > 1) {
      const firstWaveId = waves.find(w => w.id !== waveId)?.id || waves[0].id;
      reassignEmployeesFromWave(waveId, firstWaveId, waves);
    }
    handleRemoveWave(waveId, () => applyWaveDistribution(waves));
  };

  // Modify wave time with assignment updates
  const handleWaveTimeChangeWithAssignments = (waveId: number, newTime: string) => {
    handleWaveTimeChange(waveId, newTime, updateAssignmentTimes);
  };

  // Handle employee wave changes while maintaining the wave context
  const handleEmployeeWaveChange = (employeeId: string, waveId: number) => {
    handleEmployeeWaveChangeBase(employeeId, waveId, waves);
  };

  // Neuer Handler für das Hinzufügen einer Welle mit automatischer Verteilung
  const handleAddWaveWithDistribution = () => {
    handleAddWave(() => applyWaveDistribution(waves));
  };

  return {
    waves,
    employeesPerWave,
    assignments,
    handleAddWave: handleAddWaveWithDistribution,
    handleRemoveWave: handleWaveRemoveWithReassignment,
    handleWaveTimeChange: handleWaveTimeChangeWithAssignments,
    handleRequestedCountChange: (waveId: number, newCount: number) => 
      handleRequestedCountChange(waveId, newCount, () => applyWaveDistribution(waves)),
    handleEmployeeWaveChange,
    getEmployeeWaveId,
    applyWaveDistribution: () => applyWaveDistribution(waves)
  };
};
