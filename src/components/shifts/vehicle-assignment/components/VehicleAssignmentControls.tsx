
import React from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { WandSparkles, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <h2 className="text-xl font-semibold">Fahrzeugzuordnung</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={onAutoAssign}
            className="gap-2"
            disabled={!isScheduleFinalized}
          >
            <WandSparkles className="h-4 w-4" />
            Auto-Zuordnung für {formattedTomorrow}
          </Button>
          <Button 
            disabled={Object.keys(tomorrowAssignments).length === 0 || !isScheduleFinalized}
            onClick={onSaveAssignments}
          >
            <Car className="h-4 w-4 mr-2" />
            Zuordnungen speichern
          </Button>
        </div>
      </div>
      
      {!isScheduleFinalized && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Der Dienstplan ist nicht finalisiert. Bitte finalisieren Sie erst den Dienstplan für den morgigen Tag.
          </AlertDescription>
        </Alert>
      )}
      
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
    </div>
  );
};

export default VehicleAssignmentControls;
