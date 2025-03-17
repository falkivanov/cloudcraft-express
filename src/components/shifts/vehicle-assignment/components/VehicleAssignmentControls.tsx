
import React from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { WandSparkles, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface VehicleAssignmentControlsProps {
  isScheduleFinalized: boolean;
  overrideFinalized: boolean;
  setOverrideFinalized: (value: boolean) => void;
  tomorrowAssignments: Record<string, string>;
  onAutoAssign: () => void;
  onSaveAssignments: () => void;
}

const VehicleAssignmentControls: React.FC<VehicleAssignmentControlsProps> = ({
  isScheduleFinalized,
  overrideFinalized,
  setOverrideFinalized,
  tomorrowAssignments,
  onAutoAssign,
  onSaveAssignments
}) => {
  const tomorrow = addDays(new Date(), 1);
  const formattedTomorrow = format(tomorrow, "dd.MM.yyyy", { locale: de });

  return (
    <>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Fahrzeugzuordnung</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onAutoAssign}
            className="gap-2"
          >
            <WandSparkles className="h-4 w-4" />
            Auto-Zuordnung für {formattedTomorrow}
          </Button>
          <Button 
            disabled={Object.keys(tomorrowAssignments).length === 0}
            onClick={onSaveAssignments}
          >
            <Car className="h-4 w-4 mr-2" />
            Zuordnungen speichern
          </Button>
        </div>
      </div>
      
      {!isScheduleFinalized && (
        <div className="flex items-center space-x-2 bg-muted p-4 rounded-md mb-4">
          <Switch
            id="override-finalized"
            checked={overrideFinalized}
            onCheckedChange={setOverrideFinalized}
          />
          <Label htmlFor="override-finalized">Test-Modus: Finalisierung überschreiben</Label>
          <div className="text-xs text-muted-foreground ml-2">
            (Nur zu Testzwecken, deaktiviert die Dienstplan-Finalisierungsprüfung)
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleAssignmentControls;
