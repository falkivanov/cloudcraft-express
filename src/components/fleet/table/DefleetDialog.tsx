
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Vehicle } from "@/types/vehicle";

interface DefleetDialogProps {
  selectedVehicle: Vehicle | null;
  open: boolean;
  defleetDate: string;
  onOpenChange: (open: boolean) => void;
  onDefleetDateChange: (date: string) => void;
  onDefleet: () => void;
}

const DefleetDialog = ({
  selectedVehicle,
  open,
  defleetDate,
  onOpenChange,
  onDefleetDateChange,
  onDefleet
}: DefleetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fahrzeug Defleet</DialogTitle>
          <DialogDescription>
            Wählen Sie das Defleet-Datum für das Fahrzeug aus.
          </DialogDescription>
        </DialogHeader>
        {selectedVehicle && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Kennzeichen:</span>
              <span>{selectedVehicle.licensePlate}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Defleet Datum:</span>
              <Input
                type="date"
                value={defleetDate}
                onChange={(e) => onDefleetDateChange(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={onDefleet}>Defleet</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DefleetDialog;
