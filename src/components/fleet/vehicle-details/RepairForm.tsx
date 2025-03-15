
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface RepairFormProps {
  newRepair: {
    startDate: string;
    endDate: string;
    description: string;
    location: string;
    totalCost: number;
    companyPaidAmount: number;
  };
  setNewRepair: React.Dispatch<React.SetStateAction<{
    startDate: string;
    endDate: string;
    description: string;
    location: string;
    totalCost: number;
    companyPaidAmount: number;
  }>>;
  onCancel: () => void;
  onSubmit: () => void;
}

const RepairForm = ({ newRepair, setNewRepair, onCancel, onSubmit }: RepairFormProps) => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRepair.description.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Beschreibung der Reparatur ein.",
        variant: "destructive"
      });
      return;
    }

    if (!newRepair.location.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie den Ort der Reparatur ein.",
        variant: "destructive"
      });
      return;
    }

    if (new Date(newRepair.endDate) < new Date(newRepair.startDate)) {
      toast({
        title: "Fehler",
        description: "Das Enddatum kann nicht vor dem Startdatum liegen.",
        variant: "destructive"
      });
      return;
    }

    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neue Reparatur</CardTitle>
        <CardDescription>Fügen Sie eine neue Reparatur oder einen Werkstattaufenthalt hinzu</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repair-start-date">Startdatum</Label>
                <Input 
                  id="repair-start-date" 
                  type="date" 
                  value={newRepair.startDate}
                  onChange={(e) => setNewRepair({...newRepair, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repair-end-date">Enddatum</Label>
                <Input 
                  id="repair-end-date" 
                  type="date" 
                  value={newRepair.endDate}
                  onChange={(e) => setNewRepair({...newRepair, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="repair-location">Werkstatt / Ort</Label>
              <Input 
                id="repair-location" 
                placeholder="Name und Ort der Werkstatt"
                value={newRepair.location}
                onChange={(e) => setNewRepair({...newRepair, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repair-description">Beschreibung</Label>
              <Textarea 
                id="repair-description" 
                placeholder="Beschreiben Sie die durchgeführten Arbeiten"
                value={newRepair.description}
                onChange={(e) => setNewRepair({...newRepair, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repair-total-cost">Gesamtkosten (€)</Label>
                <Input 
                  id="repair-total-cost" 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={newRepair.totalCost}
                  onChange={(e) => setNewRepair({...newRepair, totalCost: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repair-company-paid">Unternehmen bezahlt (€)</Label>
                <Input 
                  id="repair-company-paid" 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={newRepair.companyPaidAmount}
                  onChange={(e) => setNewRepair({...newRepair, companyPaidAmount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
          <Button type="submit">Reparatur hinzufügen</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RepairForm;
