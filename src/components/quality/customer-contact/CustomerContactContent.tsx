
import React from "react";
import NoDataMessage from "../NoDataMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UploadIcon } from "lucide-react";
import CustomerContactTable from "./CustomerContactTable";
import ComplianceStatistics from "./ComplianceStatistics";
import { CustomerContactContentProps } from "./types";

const CustomerContactContent: React.FC<CustomerContactContentProps> = ({ 
  customerContactData, 
  driversData 
}) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>Customer Contact Report</div>
            <Button asChild variant="outline" size="sm">
              <Link to="/file-upload" className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                <span>Neue Datei hochladen</span>
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <ComplianceStatistics driversData={driversData} />
      <CustomerContactTable driversData={driversData} />
    </div>
  );
};

export default CustomerContactContent;
