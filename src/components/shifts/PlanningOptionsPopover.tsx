
import React from "react";
import { Button } from "@/components/ui/button";
import { ZapIcon, CalendarIcon, CalendarPlusIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PlanningMode = "forecast" | "maximum";

interface PlanningOptionsPopoverProps {
  planningMode: PlanningMode;
  setPlanningMode: (mode: PlanningMode) => void;
  onPlanNow: () => void;
  isLoading: boolean;
  isPlanningOptionsOpen: boolean;
  setIsPlanningOptionsOpen: (open: boolean) => void;
}

const PlanningOptionsPopover: React.FC<PlanningOptionsPopoverProps> = ({
  planningMode,
  setPlanningMode,
  onPlanNow,
  isLoading,
  isPlanningOptionsOpen,
  setIsPlanningOptionsOpen
}) => {
  return (
    <Popover open={isPlanningOptionsOpen} onOpenChange={setIsPlanningOptionsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isLoading}
          className="bg-black hover:bg-gray-800"
        >
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Plane...
            </>
          ) : (
            <>
              <ZapIcon className="mr-2 h-4 w-4" />
              Automatisch planen
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-4">
          <h4 className="font-medium">Planungsmodus wählen</h4>
          <RadioGroup 
            value={planningMode} 
            onValueChange={(value) => setPlanningMode(value as PlanningMode)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="forecast" id="forecast" />
              <Label htmlFor="forecast" className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                <span>Nach Forecast planen</span>
              </Label>
            </div>
            <div className="text-xs text-muted-foreground ml-6">
              Nur so viele Mitarbeiter einplanen, wie im Forecast benötigt
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="maximum" id="maximum" />
              <Label htmlFor="maximum" className="flex items-center gap-1.5">
                <CalendarPlusIcon className="h-4 w-4" />
                <span>Maximal planen</span>
              </Label>
            </div>
            <div className="text-xs text-muted-foreground ml-6">
              So viele Mitarbeiter wie möglich einplanen, unabhängig vom Forecast
            </div>
          </RadioGroup>
          
          <div className="flex justify-end">
            <Button 
              onClick={onPlanNow}
              disabled={isLoading}
            >
              Jetzt planen
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PlanningOptionsPopover;
