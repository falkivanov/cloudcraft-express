
import React from "react";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeeContactButtonsProps {
  email: string;
  phone: string;
}

const EmployeeContactButtons: React.FC<EmployeeContactButtonsProps> = ({ 
  email, 
  phone 
}) => {
  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="icon" title={email}>
        <Mail className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" title={phone}>
        <Phone className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default EmployeeContactButtons;
