
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bundesland, bundeslandLabels, getSelectedBundesland, saveSelectedBundesland } from "../utils/planning/holidays-utils";
import { useToast } from "@/hooks/use-toast";

const RegionSettings: React.FC = () => {
  const { toast } = useToast();
  const [selectedBundesland, setSelectedBundesland] = useState<Bundesland>(getSelectedBundesland());

  const handleBundeslandChange = (value: string) => {
    const bundesland = value as Bundesland;
    setSelectedBundesland(bundesland);
    saveSelectedBundesland(bundesland);
    
    toast({
      title: "Bundesland geändert",
      description: `Die Feiertagsregelung wurde auf ${bundeslandLabels[bundesland]} umgestellt.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regionale Einstellungen</CardTitle>
        <CardDescription>
          Legen Sie fest, nach welchem Bundesland die Feiertage für die Dienstplanung berücksichtigt werden sollen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <label htmlFor="bundesland-select" className="text-sm font-medium">
              Bundesland für Feiertagsregelung
            </label>
            <Select value={selectedBundesland} onValueChange={handleBundeslandChange}>
              <SelectTrigger id="bundesland-select" className="w-full">
                <SelectValue placeholder="Bundesland auswählen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(bundeslandLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Diese Einstellung bestimmt, welche gesetzlichen Feiertage in der Dienstplanung berücksichtigt werden.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionSettings;
