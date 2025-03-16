
import React from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface EmployeeContactButtonsProps {
  phone: string;
}

const EmployeeContactButtons: React.FC<EmployeeContactButtonsProps> = ({ 
  phone 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Telefonnummer anzeigen"
          >
            <Phone className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <p className="text-sm font-medium">+{phone}</p>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmployeeContactButtons;
