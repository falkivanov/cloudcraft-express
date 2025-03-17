
import React from "react";
import { AlertTriangle } from "lucide-react";

const VehicleAssignmentLegend = () => {
  return (
    <div className="mb-4">
      <div className="text-sm font-medium">Legende:</div>
      <div className="flex gap-4 mt-1">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-50 mr-2 border border-blue-100"></div>
          <span className="text-sm">Neuer Schlüssel benötigt</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-50 mr-2 border border-amber-100"></div>
          <span className="text-sm">Schlüsseltausch benötigt</span>
        </div>
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
          <span className="text-sm">Nicht das präferierte Fahrzeug</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleAssignmentLegend;
