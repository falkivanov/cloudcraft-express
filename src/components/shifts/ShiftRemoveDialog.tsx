
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShiftRemoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ShiftRemoveDialog: React.FC<ShiftRemoveDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Termin ändern</AlertDialogTitle>
          <AlertDialogDescription>
            Sind Sie sicher, dass Sie diesen Termin ändern möchten?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Ja, ändern
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShiftRemoveDialog;
