
import React from "react";
import { AlertTriangleIcon } from "lucide-react";

const UnavailableCell: React.FC = () => {
  return (
    <div 
      className="w-full h-full min-h-[3.5rem] flex items-center justify-center bg-gray-100"
      title="Mitarbeiter ist an diesem Tag nicht verfügbar"
    >
      <div className="flex flex-col items-center text-gray-400">
        <AlertTriangleIcon className="h-4 w-4" />
        <span className="text-xs mt-1">Nicht verfügbar</span>
      </div>
    </div>
  );
};

export default UnavailableCell;
