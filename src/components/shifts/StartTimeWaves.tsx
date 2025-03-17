
import React from "react";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/employee";
import { WaveAssignment } from "@/types/shift";
import { useWaveAssignments } from "./hooks/useWaveAssignments";
import WaveControlsSection from "./wave-cards/WaveControlsSection";
import EmployeeAssignmentSection from "./employee-assignments/EmployeeAssignmentSection";

interface StartTimeWavesProps {
  scheduledEmployees: Employee[];
  onAssignWaves: (waveAssignments: WaveAssignment[]) => void;
}

const StartTimeWaves: React.FC<StartTimeWavesProps> = ({ 
  scheduledEmployees,
  onAssignWaves
}) => {
  const {
    waves,
    employeesPerWave,
    assignments,
    handleAddWave,
    handleRemoveWave,
    handleWaveTimeChange,
    handleRequestedCountChange,
    handleEmployeeWaveChange,
    getEmployeeWaveId
  } = useWaveAssignments(scheduledEmployees);
  
  // Save the wave assignments
  const handleSaveAssignments = () => {
    onAssignWaves(assignments);
  };

  return (
    <div className="space-y-4 mt-4">
      <WaveControlsSection
        waves={waves}
        employeesPerWave={employeesPerWave}
        totalEmployees={scheduledEmployees.length}
        onAddWave={handleAddWave}
        onRemoveWave={handleRemoveWave}
        onWaveTimeChange={handleWaveTimeChange}
        onRequestedCountChange={handleRequestedCountChange}
      />
      
      <EmployeeAssignmentSection
        scheduledEmployees={scheduledEmployees}
        waves={waves}
        onEmployeeWaveChange={handleEmployeeWaveChange}
        getEmployeeWaveId={getEmployeeWaveId}
      />
      
      <div className="flex justify-end mt-4">
        <Button onClick={handleSaveAssignments}>
          Startzeitwellen speichern
        </Button>
      </div>
    </div>
  );
};

export default StartTimeWaves;
