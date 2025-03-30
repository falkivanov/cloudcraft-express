
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import DetailItem from "./DetailItem";
import { LucideIcon } from "lucide-react";

interface BooleanIndicatorProps {
  icon: LucideIcon;
  label: string;
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
}

const BooleanIndicator: React.FC<BooleanIndicatorProps> = ({ 
  icon, 
  label, 
  value, 
  trueLabel = "Ja",
  falseLabel = "Nein"
}) => {
  return (
    <DetailItem
      icon={icon}
      label={label}
      value={
        <div className="mt-1">
          {value ? (
            <span className="inline-flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" /> {trueLabel}
            </span>
          ) : (
            <span className="inline-flex items-center text-red-600">
              <XCircle className="h-4 w-4 mr-1" /> {falseLabel}
            </span>
          )}
        </div>
      }
    />
  );
};

export default BooleanIndicator;
