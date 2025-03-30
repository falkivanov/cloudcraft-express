import React from "react";
import NoDataMessage from "../NoDataMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CalendarIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CustomerContactContentProps {
  customerContactData: string | null;
  driversData: any[];
}

const CustomerContactContent: React.FC<CustomerContactContentProps> = ({ customerContactData, driversData }) => {
  if (!customerContactData || driversData.length === 0) {
    return (
      <NoDataMessage
        category="Customer Contact"
        customMessage="Es wurden keine Customer Contact Daten gefunden. Bitte lade zuerst die HTML-Datei hoch."
      />
    );
  }

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-green-500" />
              Customer Contact Daten
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/file-upload" className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                <span>Neue Datei hochladen</span>
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <CalendarIcon className="h-4 w-4" />
            <span>
              Geladene HTML-Datei enthält {driversData.length} Fahrer
            </span>
          </div>
          <div className="border p-4 rounded-md bg-green-50/50">
            <p className="text-muted-foreground italic">
              Die Darstellung der Customer Contact Daten kann hier erweitert
              werden
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerContactContent;
