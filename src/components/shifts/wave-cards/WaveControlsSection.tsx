
import React from "react";
import { Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaveCard from "./WaveCard";
import { Wave, WaveEmployeeCount } from "../types/wave-types";

interface WaveControlsSectionProps {
  waves: Wave[];
  employeesPerWave: WaveEmployeeCount[];
  totalEmployees: number;
  onAddWave: () => void;
  onRemoveWave: (waveId: number) => void;
  onWaveTimeChange: (waveId: number, newTime: string) => void;
  onRequestedCountChange: (waveId: number, newCount: number) => void;
}

const WaveControlsSection: React.FC<WaveControlsSectionProps> = ({
  waves,
  employeesPerWave,
  totalEmployees,
  onAddWave,
  onRemoveWave,
  onWaveTimeChange,
  onRequestedCountChange,
}) => {
  const waveCount = waves.length;

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex justify-between items-center">
        <div className="font-medium text-lg flex items-center gap-2">
          <Waves className="h-5 w-5 text-blue-500" />
          <span>Startzeitenwellen</span>
        </div>

        {waveCount < 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddWave}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            Welle hinzufügen
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        {waves.map((wave) => {
          const employeeCount =
            employeesPerWave.find((w) => w.waveId === wave.id)?.count || 0;

          return (
            <WaveCard
              key={wave.id}
              wave={wave}
              employeeCount={employeeCount}
              totalEmployees={totalEmployees}
              onRemove={onRemoveWave}
              onTimeChange={onWaveTimeChange}
              onRequestedCountChange={onRequestedCountChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WaveControlsSection;
