
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

interface FinalizeDayButtonProps {
  date: Date;
  onFinalize: (dateKey: string) => void;
  dateKey: string;
  isFinalized: boolean;
}

const FinalizeDayButton: React.FC<FinalizeDayButtonProps> = ({ 
  date, 
  onFinalize, 
  dateKey,
  isFinalized
}) => {
  return (
    <Button 
      variant={isFinalized ? "secondary" : "outline"} 
      className="w-full"
      onClick={() => onFinalize(dateKey)}
      disabled={isFinalized}
      size="sm"
    >
      {isFinalized ? (
        <>
          <CheckIcon className="h-4 w-4 mr-1" />
          Finalisiert
        </>
      ) : (
        <>Tag finalisieren</>
      )}
    </Button>
  );
};

export default FinalizeDayButton;
