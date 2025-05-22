
import React from 'react';
import { Container } from '@/components/ui/container';
import DataMigrationTool from '@/components/migration/DataMigrationTool';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, InfoIcon } from 'lucide-react';

const DataMigrationPage = () => {
  return (
    <Container className="py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Backend-Migration</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="migrate">Daten migrieren</TabsTrigger>
            <TabsTrigger value="help">Hilfe</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Migrations-Dashboard</CardTitle>
                <CardDescription>
                  Status der Migration von lokalem Speicher zu Backend-API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">API-Services implementiert</h3>
                      <p className="text-sm text-gray-500">
                        Alle notwendigen API-Dienste für die Backend-Kommunikation wurden erstellt.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Datenmigration im Gange</h3>
                      <p className="text-sm text-gray-500">
                        Benutzen Sie den "Daten migrieren"-Tab, um Ihre lokalen Daten zum Backend zu übertragen.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <InfoIcon className="text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Offline-Funktionalität</h3>
                      <p className="text-sm text-gray-500">
                        Die Anwendung unterstützt nun automatischen Fallback auf lokale Daten bei Verbindungsproblemen.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="migrate">
            <DataMigrationTool />
          </TabsContent>
          
          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Migrations-Hilfe</CardTitle>
                <CardDescription>
                  Antworten auf häufig gestellte Fragen zur Migration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Was passiert mit meinen lokalen Daten?</h3>
                    <p className="text-sm text-gray-500">
                      Ihre lokalen Daten bleiben erhalten, werden aber zusätzlich in die Backend-Datenbank kopiert.
                      Nach erfolgreicher Migration werden neue Änderungen in beiden Systemen synchronisiert.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Kann ich die Migration rückgängig machen?</h3>
                    <p className="text-sm text-gray-500">
                      Die Migration fügt lediglich Daten zur Datenbank hinzu, ändert aber nichts an Ihren lokalen Daten.
                      Sie können jederzeit wieder auf den lokalen Modus umschalten.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Was passiert bei Duplikaten?</h3>
                    <p className="text-sm text-gray-500">
                      Das System erkennt Duplikate anhand von IDs und überspringt diese während der Migration.
                      Ihnen wird angezeigt, wie viele Einträge erfolgreich migriert, übersprungen oder fehlgeschlagen sind.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Funktioniert die App ohne Internetverbindung?</h3>
                    <p className="text-sm text-gray-500">
                      Ja, die App unterstützt Offline-Funktionalität. Bei fehlender Verbindung werden Änderungen
                      lokal gespeichert und automatisch synchronisiert, sobald die Verbindung wiederhergestellt ist.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default DataMigrationPage;
