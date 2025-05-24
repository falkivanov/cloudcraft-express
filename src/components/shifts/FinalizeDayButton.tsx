
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CalendarIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface FinalizeDayButtonProps {
  date: Date;
  onFinalize: (dateKey: string) => void;
  dateKey: string;
  isFinalized: boolean;
  isTwoWeekView?: boolean;
}

const FinalizeDayButton: React.FC<FinalizeDayButtonProps> = ({ 
  date, 
  onFinalize, 
  dateKey,
  isFinalized,
  isTwoWeekView = false
}) => {
  // Handle the finalize button click
  const handleClick = (e: React.MouseEvent) => {
    // Prevent any default behavior that might cause page reload
    e.preventDefault();
    e.stopPropagation();
    
    if (!dateKey) {
      console.error('Invalid dateKey provided to FinalizeDayButton');
      toast.error("Fehler beim Finalisieren des Tages", {
        description: "Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      });
      return;
    }
    
    onFinalize(dateKey);
    
    try {
      // Dispatch an event to make sure all components are aware of the change
      window.dispatchEvent(new CustomEvent('dayFinalized', { 
        detail: { dateKey, shouldSwitchToNextDay: true } 
      }));
      
      // Auch den globalen Finalisierungsstatus setzen
      // Verwende try-catch für jede localStorage-Operation
      try {
        localStorage.setItem('isScheduleFinalized', JSON.stringify(true));
        
        // Speichere auch einen Zeitstempel, um die Daten vor versehentlichem Löschen zu schützen
        localStorage.setItem('dataTimestamp', Date.now().toString());
      } catch (storageError) {
        console.error('Error writing to localStorage:', storageError);
      }
      
      // Trigger storage event on the current window (for components in the same window)
      window.dispatchEvent(new Event('storage'));
      
      toast.success("Tag erfolgreich finalisiert", {
        description: "Sie können jetzt den Einsatzplan für morgen ansehen."
      });
    } catch (error) {
      console.error('Error finalizing day:', error);
      
      // Still show success toast because onFinalize already executed successfully
      // but add warning about persistence
      toast.success("Tag finalisiert", {
        description: "Der Tag wurde finalisiert, aber es gab ein Problem beim Speichern. Einige Funktionen könnten beeinträchtigt sein."
      });
    }
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant={isFinalized ? "secondary" : "default"} 
          className="w-full"
          onClick={handleClick}
          disabled={isFinalized}
          size={isTwoWeekView ? "sm" : "sm"}
          type="button" // Explicitly set to button to prevent form submission behavior
        >
          {isFinalized ? (
            <>
              <CheckIcon className={`h-4 w-4 ${!isTwoWeekView ? 'mr-1' : ''}`} />
              {!isTwoWeekView && 'Finalisiert'}
            </>
          ) : (
            <>
              <CalendarIcon className={`h-4 w-4 ${!isTwoWeekView ? 'mr-1' : ''}`} />
              {!isTwoWeekView && 'Tag finalisieren'}
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Dienplan für morgigen Tag finalisieren</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default FinalizeDayButton;
