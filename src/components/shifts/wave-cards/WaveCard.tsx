
import React from "react";
import { Clock, Users, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wave, WaveEmployeeCount } from "../types/wave-types";

interface WaveCardProps {
  wave: Wave;
  employeeCount: number;
  totalEmployees: number;
  onRemove: (waveId: number) => void;
  onTimeChange: (waveId: number, newTime: string) => void;
  onRequestedCountChange: (waveId: number, newCount: number) => void;
}

const WaveCard: React.FC<WaveCardProps> = ({
  wave,
  employeeCount,
  totalEmployees,
  onRemove,
  onTimeChange,
  onRequestedCountChange,
}) => {
  // Calculate deviation from the requested count
  const deviation = employeeCount - wave.requestedCount;
  const hasDeviation = deviation !== 0;

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center">
            Welle {wave.id}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(wave.id)}
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
            onChange={(e) => onTimeChange(wave.id, e.target.value)}
            className="h-8"
          />
        </div>

        <div className="mt-3 flex items-center space-x-2">
          <Users className="h-4 w-4 text-primary" />
          <div className="flex-1 flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max={totalEmployees}
              value={wave.requestedCount}
              onChange={(e) =>
                onRequestedCountChange(wave.id, parseInt(e.target.value) || 0)
              }
              className="h-8 w-20"
            />
            <span className="text-sm text-muted-foreground">von {totalEmployees}</span>
          </div>
        </div>

        <div className="mt-2 text-sm">
          <span className={hasDeviation ? "text-yellow-600 font-medium" : "text-muted-foreground"}>
            {employeeCount} Mitarbeiter aktuell zugeordnet
            {hasDeviation && (
              <span className="ml-1">
                ({deviation > 0 ? "+" : ""}{deviation} zur Vorgabe)
              </span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaveCard;
