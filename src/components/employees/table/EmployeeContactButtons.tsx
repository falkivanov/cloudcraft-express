
import React, { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EmployeeContactButtonsProps {
  phone: string;
}

const EmployeeContactButtons: React.FC<EmployeeContactButtonsProps> = ({ 
  phone 
}) => {
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  const handlePhoneClick = () => {
    setShowPhoneNumber(prev => !prev);
  };

  return (
    <div className="flex items-center space-x-2">
      {showPhoneNumber ? (
        <span className="text-sm font-medium">{phone}</span>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePhoneClick}
                aria-label="Telefonnummer anzeigen"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Telefonnummer anzeigen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default EmployeeContactButtons;
