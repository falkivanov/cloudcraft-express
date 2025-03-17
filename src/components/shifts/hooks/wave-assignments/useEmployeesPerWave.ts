
import { useMemo } from "react";
import { Wave, WaveAssignment, WaveEmployeeCount } from "../../types/wave-types";

export const useEmployeesPerWave = (waves: Wave[], assignments: WaveAssignment[]) => {
  // Count employees per wave
  const employeesPerWave = useMemo((): WaveEmployeeCount[] => {
    return waves.map(wave => {
      return {
        waveId: wave.id,
        count: assignments.filter(a => a.waveNumber === wave.id).length
      };
    });
  }, [waves, assignments]);

  return employeesPerWave;
};
