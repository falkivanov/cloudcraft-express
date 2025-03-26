
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CalendarIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

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
    
    // Auch den globalen Finalisierungsstatus setzen
    try {
      localStorage.setItem('isScheduleFinalized', JSON.stringify(true));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving schedule finalized status to localStorage:', error);
    }
    
    toast.success("Tag erfolgreich finalisiert", {
      description: "Sie können jetzt mit der Fahrzeugzuordnung fortfahren."
    });
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
