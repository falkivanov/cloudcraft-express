
import React from "react";
import { Employee } from "@/types/employee";
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

interface FlexibilityOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onConfirm: () => void;
}

const FlexibilityOverrideDialog: React.FC<FlexibilityOverrideDialogProps> = ({
  open,
  onOpenChange,
  employee,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Flexibilität vorübergehend aufheben?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchten Sie die Arbeitstage-Einschränkung für {employee?.name} für diese Woche aufheben?
            Der Mitarbeiter kann dann für die aktuelle Woche an allen Tagen eingeplant werden, nicht nur an den bevorzugten Tagen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Bestätigen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FlexibilityOverrideDialog;
