
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BatchActionButtonsProps {
  selectedCount: number;
  onReactivate: () => void;
  onDelete: () => void;
}

const BatchActionButtons: React.FC<BatchActionButtonsProps> = ({
  selectedCount,
  onReactivate,
  onDelete
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex gap-2">
      <Button 
        onClick={onReactivate}
        className="flex items-center gap-2"
        variant="outline"
      >
        <RefreshCw className="h-4 w-4" />
        {selectedCount} Mitarbeiter reaktivieren
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            className="flex items-center gap-2"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
            {selectedCount} Mitarbeiter löschen
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitarbeiter löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie wirklich {selectedCount} Mitarbeiter löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BatchActionButtons;
