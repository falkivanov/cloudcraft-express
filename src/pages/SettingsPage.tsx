import React from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegionSettings from "@/components/settings/RegionSettings";
import ScorecardSettings from "@/components/settings/ScorecardSettings";
import FinanceSettings from "@/components/settings/FinanceSettings";

const SettingsPage = () => {
  return (
    <Container className="py-6">
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
          <TabsTrigger value="account">Konto</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid gap-6">
            <RegionSettings />
            
            <FinanceSettings />
            
            {/* Weitere allgemeine Einstellungskarten können hier hinzugefügt werden */}
            <Card>
              <CardHeader>
                <CardTitle>App-Einstellungen</CardTitle>
                <CardDescription>
                  Passen Sie das Erscheinungsbild und Verhalten der Anwendung an.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Weitere Einstellungen werden in zukünftigen Updates verfügbar sein.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="scorecard">
          <div className="grid gap-6">
            <ScorecardSettings />
          </div>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Konto-Einstellungen</CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Kontodaten und Sicherheitseinstellungen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Konto-Einstellungen werden in zukünftigen Updates verfügbar sein.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungseinstellungen</CardTitle>
              <CardDescription>
                Legen Sie fest, wie und wann Sie benachrichtigt werden möchten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Benachrichtigungseinstellungen werden in zukünftigen Updates verfügbar sein.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default SettingsPage;
