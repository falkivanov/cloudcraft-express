
import React, { useEffect } from "react";
import NoDataMessage from "../NoDataMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UploadIcon } from "lucide-react";
import CustomerContactTable from "./CustomerContactTable";
import ComplianceStatistics from "./ComplianceStatistics";
import { CustomerContactContentProps } from "./types";
import CustomerContactWeekSelector from "./CustomerContactWeekSelector";
import { useCustomerContactWeek } from "./hooks/useCustomerContactWeek";
import { toast } from "sonner";

const CustomerContactContent: React.FC<CustomerContactContentProps> = ({ 
  customerContactData, 
  driversData 
}) => {
  const { selectedWeek, setSelectedWeek, availableWeeks, loadWeekData } = useCustomerContactWeek();
  const [weekDriversData, setWeekDriversData] = React.useState(driversData);
  
  // When selected week changes, update driver data from localStorage
  useEffect(() => {
    if (availableWeeks.length > 0) {
      try {
        const weekData = loadWeekData();
        console.log(`Loaded ${weekData.length} drivers for week ${selectedWeek}`);
        setWeekDriversData(weekData);
        
        const selectedWeekObj = availableWeeks.find(w => w.id === selectedWeek);
        if (selectedWeekObj) {
          const weekLabel = selectedWeekObj.label;
          toast.info(`Daten für ${weekLabel} geladen`, {
            duration: 2000,
          });
        }
      } catch (error) {
        console.error("Error loading week data:", error);
        toast.error("Fehler beim Laden der Wochendaten", {
          description: "Bitte versuchen Sie es erneut oder laden Sie die Datei neu hoch."
        });
      }
    }
  }, [selectedWeek, availableWeeks]);
  
  if (!customerContactData || (weekDriversData.length === 0 && driversData.length === 0)) {
    return (
      <NoDataMessage
        category="customer-contact"
        customMessage="Es wurden keine Customer Contact Daten gefunden. Bitte lade zuerst die HTML-Datei hoch."
      />
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Contact Report</h2>
        <div className="flex items-center gap-4">
          <CustomerContactWeekSelector 
            selectedWeek={selectedWeek} 
            setSelectedWeek={setSelectedWeek}
            availableWeeks={availableWeeks}
          />
          <Button asChild variant="outline" size="sm">
            <Link to="/file-upload" className="flex items-center gap-2">
              <UploadIcon className="h-4 w-4" />
              <span>Neue Datei hochladen</span>
            </Link>
          </Button>
        </div>
      </div>

      <ComplianceStatistics driversData={weekDriversData.length > 0 ? weekDriversData : driversData} />
      <CustomerContactTable driversData={weekDriversData.length > 0 ? weekDriversData : driversData} />
    </div>
  );
};

export default CustomerContactContent;
