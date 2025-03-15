
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dummy-Daten für Mitarbeiter - In einer realen Anwendung würden diese aus einer API kommen
const employees = [
  { id: "1", name: "Max Mustermann" },
  { id: "2", name: "Anna Schmidt" },
  { id: "3", name: "Thomas Müller" },
  { id: "4", name: "Lisa Weber" },
  { id: "5", name: "Michael Fischer" },
];

interface RepairFormProps {
  newRepair: {
    startDate: string;
    endDate: string;
    description: string;
    location: string;
    totalCost: number;
    companyPaidAmount: number;
    causeType: "Verschleiß" | "Unfall";
    causedByEmployeeId?: string;
    causedByEmployeeName?: string;
  };
  setNewRepair: React.Dispatch<React.SetStateAction<{
    startDate: string;
    endDate: string;
    description: string;
    location: string;
    totalCost: number;
    companyPaidAmount: number;
    causeType: "Verschleiß" | "Unfall";
    causedByEmployeeId?: string;
    causedByEmployeeName?: string;
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

    if (newRepair.causeType === "Unfall" && !newRepair.causedByEmployeeId) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie den verursachenden Mitarbeiter aus.",
        variant: "destructive"
      });
      return;
    }

    onSubmit();
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    setNewRepair({
      ...newRepair, 
      causedByEmployeeId: employeeId,
      causedByEmployeeName: selectedEmployee?.name
    });
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
            <div className="space-y-2">
              <Label>Ursache</Label>
              <RadioGroup 
                value={newRepair.causeType}
                onValueChange={(value: "Verschleiß" | "Unfall") => 
                  setNewRepair({...newRepair, causeType: value, causedByEmployeeId: value === "Verschleiß" ? undefined : newRepair.causedByEmployeeId})
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Verschleiß" id="verschleiss" />
                  <Label htmlFor="verschleiss">Verschleiß</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Unfall" id="unfall" />
                  <Label htmlFor="unfall">Unfall</Label>
                </div>
              </RadioGroup>
            </div>
            
            {newRepair.causeType === "Unfall" && (
              <div className="space-y-2">
                <Label htmlFor="caused-by-employee">Verursacht durch</Label>
                <Select 
                  value={newRepair.causedByEmployeeId}
                  onValueChange={handleEmployeeSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
