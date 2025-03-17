
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CalendarIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  // Handle the finalize button click
  const handleClick = () => {
    onFinalize(dateKey);
    // Dispatch an event to make sure all components are aware of the change
    window.dispatchEvent(new CustomEvent('dayFinalized', { detail: { dateKey } }));
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={isFinalized ? "secondary" : "default"} 
            className="w-full"
            onClick={handleClick}
            disabled={isFinalized}
            size="sm"
          >
            {isFinalized ? (
              <>
                <CheckIcon className="h-4 w-4 mr-1" />
                Finalisiert
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4 mr-1" />
                Tag finalisieren
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Dienplan für morgigen Tag finalisieren</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FinalizeDayButton;
