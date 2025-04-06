
import React from "react";
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

const CustomerContactContent: React.FC<CustomerContactContentProps> = ({ 
  customerContactData, 
  driversData 
}) => {
  const { selectedWeek, setSelectedWeek } = useCustomerContactWeek();
  
  if (!customerContactData || driversData.length === 0) {
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
          />
          <Button asChild variant="outline" size="sm">
            <Link to="/file-upload" className="flex items-center gap-2">
              <UploadIcon className="h-4 w-4" />
              <span>Neue Datei hochladen</span>
            </Link>
          </Button>
        </div>
      </div>

      <ComplianceStatistics driversData={driversData} />
      <CustomerContactTable driversData={driversData} />
    </div>
  );
};

export default CustomerContactContent;
