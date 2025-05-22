
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DataMigrationSettings = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datenmigration</CardTitle>
        <CardDescription>
          Migrieren Sie lokale Daten zum Backend-Server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Übertragen Sie Ihre vorhandenen Mitarbeiter, Schichten und andere Daten aus dem lokalen Speicher zur Backend-Datenbank.
          Dies ist nötig, um von der Offline-Funktionalität auf volle Serverfunktionalität umzusteigen.
        </p>
        <Button 
          onClick={() => navigate('/migration')} 
          className="mt-2 flex items-center gap-2"
        >
          Zum Migrations-Tool
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataMigrationSettings;
