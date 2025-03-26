
import { Employee } from "@/types/employee";
import { Wave, WaveAssignment } from "../../types/wave-types";
import { useWaveState } from "./useWaveState";
import { useAssignments } from "./useAssignments";
import { useEmployeesPerWave } from "./useEmployeesPerWave";

export const useWaveAssignments = (scheduledEmployees: Employee[] = []) => {
  // Initialize wave state
  const {
    waves,
    handleAddWave,
    handleRemoveWave,
    handleWaveTimeChange,
    handleRequestedCountChange
  } = useWaveState(scheduledEmployees);

  // Initialize assignments
  const {
    assignments,
    applyWaveDistribution,
    handleEmployeeWaveChange,
    getEmployeeWaveId,
    updateAssignmentTimes,
    reassignEmployeesFromWave
  } = useAssignments(scheduledEmployees);

  // Count employees per wave
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
  const handleEmployeeWaveChangeWrapped = (employeeId: string, waveId: number) => {
    handleEmployeeWaveChange(employeeId, waveId, waves);
  };

  // Handler for adding a wave with automatic distribution
  const handleAddWaveWithDistribution = () => {
    // We pass the applyWaveDistribution function to be executed after the wave is added
    handleAddWave((updatedWaves) => {
      applyWaveDistribution(updatedWaves);
    });
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
    handleEmployeeWaveChange: handleEmployeeWaveChangeWrapped,
    getEmployeeWaveId,
    applyWaveDistribution: () => applyWaveDistribution(waves)
  };
};
