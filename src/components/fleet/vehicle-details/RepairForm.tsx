
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { employees } from "./form/EmployeeSelect";
import RepairDatesSection from "./form/RepairDatesSection";
import RepairDetailsSection from "./form/RepairDetailsSection";
import RepairCauseSection from "./form/RepairCauseSection";
import RepairCostSection from "./form/RepairCostSection";

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
            <RepairDatesSection 
              startDate={newRepair.startDate}
              endDate={newRepair.endDate}
              onStartDateChange={(value) => setNewRepair({...newRepair, startDate: value})}
              onEndDateChange={(value) => setNewRepair({...newRepair, endDate: value})}
            />

            <RepairDetailsSection 
              location={newRepair.location}
              description={newRepair.description}
              onLocationChange={(value) => setNewRepair({...newRepair, location: value})}
              onDescriptionChange={(value) => setNewRepair({...newRepair, description: value})}
            />

            <RepairCauseSection 
              causeType={newRepair.causeType}
              causedByEmployeeId={newRepair.causedByEmployeeId}
              onCauseTypeChange={(value) => 
                setNewRepair({...newRepair, causeType: value, causedByEmployeeId: value === "Verschleiß" ? undefined : newRepair.causedByEmployeeId})
              }
              onEmployeeSelect={handleEmployeeSelect}
            />

            <RepairCostSection 
              totalCost={newRepair.totalCost}
              companyPaidAmount={newRepair.companyPaidAmount}
              onTotalCostChange={(value) => setNewRepair({...newRepair, totalCost: value})}
              onCompanyPaidChange={(value) => setNewRepair({...newRepair, companyPaidAmount: value})}
            />
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
