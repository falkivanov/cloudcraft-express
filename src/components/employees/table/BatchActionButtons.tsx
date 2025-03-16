
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";

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
      
      <Button 
        onClick={onDelete}
        className="flex items-center gap-2"
        variant="destructive"
      >
        <Trash2 className="h-4 w-4" />
        {selectedCount} Mitarbeiter löschen
      </Button>
    </div>
  );
};

export default BatchActionButtons;
