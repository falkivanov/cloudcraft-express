
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

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
  const dayName = format(date, "EEEE", { locale: de });
  
  return (
    <Button 
      variant={isFinalized ? "secondary" : "outline"} 
      className="w-full mt-2"
      onClick={() => onFinalize(dateKey)}
      disabled={isFinalized}
    >
      {isFinalized ? (
        <>
          <CheckIcon className="h-4 w-4 mr-2" />
          {dayName} finalisiert
        </>
      ) : (
        <>Tag finalisieren</>
      )}
    </Button>
  );
};

export default FinalizeDayButton;
