
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee } from "@/types/employee";

interface ContractEndDialogProps {
  selectedEmployee: Employee | null;
  open: boolean;
  endDate: string;
  onOpenChange: (open: boolean) => void;
  onEndDateChange: (date: string) => void;
  onEndContract: () => void;
}

const ContractEndDialog = ({
  selectedEmployee,
  open,
  endDate,
  onOpenChange,
  onEndDateChange,
  onEndContract
}: ContractEndDialogProps) => {
  if (!selectedEmployee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arbeitsvertrag beenden</DialogTitle>
          <DialogDescription>
            Hiermit wird der Arbeitsvertrag für {selectedEmployee.name} beendet. Dies kann später rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">Enddatum</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button onClick={onEndContract}>
            Vertrag beenden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractEndDialog;
