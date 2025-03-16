
import React from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

interface CustomerContactContentProps {
  customerContactData: string | null;
  driversData: DriverComplianceData[];
}

const CustomerContactContent: React.FC<CustomerContactContentProps> = ({ 
  customerContactData, 
  driversData 
}) => {
  // Generate personalized message for drivers with compliance below 98%
  const generateDriverMessage = (driver: DriverComplianceData) => {
    return `Hi ${driver.firstName}, letzte Woche musstest du ${driver.totalAddresses} Kunden kontaktiert, hast aber nur ${driver.totalContacts} kontaktiert. Immer wenn du ein Paket nicht zustellen kannst musst du den Kunden anrufen oder eine SMS schreiben. Bitte versuch diese Woche auf 100% zu kommen.`;
  };

  // Style for compliance values
  const getComplianceStyle = (percentage: number) => {
    return percentage < 98 
      ? "bg-red-100 text-red-800 font-semibold"
      : "bg-green-100 text-green-800 font-semibold";
  };

  if (!customerContactData) {
    return renderNoDataMessage("Customer Contact");
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Enhanced display with colored compliance values */}
      <div 
        className="max-h-[500px] overflow-auto border rounded p-4 bg-slate-50 customer-contact-report"
        dangerouslySetInnerHTML={{ 
          __html: customerContactData.replace(
            /<td>(\d+(\.\d+)?)%<\/td>/g, 
            (match, percentage) => {
              const value = parseFloat(percentage);
              const colorClass = value < 98 ? 'bg-red-100 text-red-800 font-semibold' : 'bg-green-100 text-green-800 font-semibold';
              return `<td class="${colorClass} px-2 py-1 rounded">${value}%</td>`;
            }
          ) 
        }} 
      />
      
      {/* Display personalized messages for drivers with compliance below 98% */}
      {driversData.filter(driver => driver.compliancePercentage < 98).length > 0 && (
        <div className="mt-8 border rounded-lg p-4 bg-amber-50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Personalisierte Nachrichten für Fahrer mit Compliance unter 98%
          </h3>
          <div className="space-y-4">
            {driversData
              .filter(driver => driver.compliancePercentage < 98)
              .map((driver, index) => (
                <div key={index} className="p-3 bg-white rounded-md border">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold">{driver.name}</span>
                    <Badge className={getComplianceStyle(driver.compliancePercentage)}>
                      {driver.compliancePercentage}%
                    </Badge>
                  </div>
                  <p className="text-sm">{generateDriverMessage(driver)}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Hilfsfunktion für die "Keine Daten" Meldung
const renderNoDataMessage = (category: string) => {
  return (
    <div className="mt-6 p-6 border rounded-lg bg-gray-50 text-center">
      <p className="text-lg font-medium mb-3">Keine {category}-Daten verfügbar</p>
      <p className="text-muted-foreground mb-4">
        Bitte laden Sie zuerst eine Datei hoch, um die Daten hier anzuzeigen.
      </p>
      <Button asChild>
        <Link to="/file-upload" className="flex items-center gap-2">
          <UploadIcon className="h-4 w-4" />
          <span>Zur Upload-Seite</span>
        </Link>
      </Button>
    </div>
  );
};

export default CustomerContactContent;
