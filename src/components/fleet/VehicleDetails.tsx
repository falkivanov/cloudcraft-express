
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Vehicle, RepairEntry } from "@/types/vehicle";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Info, Wrench, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VehicleDetailsProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const VehicleDetails = ({ 
  vehicle, 
  open, 
  onOpenChange,
  onUpdateVehicle
}: VehicleDetailsProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [newRepair, setNewRepair] = useState<Omit<RepairEntry, "id">>({
    date: new Date().toISOString().split('T')[0],
    description: "",
    duration: 1,
    totalCost: 0,
    companyPaidAmount: 0
  });
  const { toast } = useToast();

  const formatDateString = (dateString: string | null): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch (error) {
      console.error("Invalid date format", error);
      return dateString;
    }
  };

  const handleAddRepair = () => {
    if (!vehicle) return;
    
    if (!newRepair.description.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Beschreibung der Reparatur ein.",
        variant: "destructive"
      });
      return;
    }

    const updatedVehicle = { ...vehicle };
    const repairs = updatedVehicle.repairs || [];
    
    const newRepairEntry: RepairEntry = {
      id: (Date.now().toString()),
      ...newRepair
    };
    
    updatedVehicle.repairs = [...repairs, newRepairEntry];
    
    onUpdateVehicle(updatedVehicle);
    
    // Reset the form
    setNewRepair({
      date: new Date().toISOString().split('T')[0],
      description: "",
      duration: 1,
      totalCost: 0,
      companyPaidAmount: 0
    });
    
    toast({
      title: "Reparatur hinzugefügt",
      description: `Reparatur wurde erfolgreich zum Fahrzeug ${vehicle.licensePlate} hinzugefügt.`
    });
  };

  if (!vehicle) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
          </DialogTitle>
          <DialogDescription>
            Detaillierte Informationen über das Fahrzeug
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="workshop" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span>Werkstatt</span>
            </TabsTrigger>
            <TabsTrigger value="addRepair" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Reparatur hinzufügen</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fahrzeugdetails</CardTitle>
                <CardDescription>Grundlegende Informationen über das Fahrzeug</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kennzeichen</Label>
                  <div className="font-medium">{vehicle.licensePlate}</div>
                </div>
                <div className="space-y-2">
                  <Label>Marke</Label>
                  <div className="font-medium">{vehicle.brand}</div>
                </div>
                <div className="space-y-2">
                  <Label>Modell</Label>
                  <div className="font-medium">{vehicle.model}</div>
                </div>
                <div className="space-y-2">
                  <Label>FIN (VIN)</Label>
                  <div className="font-medium">{vehicle.vinNumber}</div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="font-medium">{vehicle.status}</div>
                </div>
                <div className="space-y-2">
                  <Label>Infleet Datum</Label>
                  <div className="font-medium">{formatDateString(vehicle.infleetDate)}</div>
                </div>
                {vehicle.defleetDate && (
                  <div className="space-y-2">
                    <Label>Defleet Datum</Label>
                    <div className="font-medium">{formatDateString(vehicle.defleetDate)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workshop" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Werkstattaufenthalte</CardTitle>
                <CardDescription>Alle Reparaturen und Werkstattaufenthalte des Fahrzeugs</CardDescription>
              </CardHeader>
              <CardContent>
                {!vehicle.repairs || vehicle.repairs.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Keine Reparaturen gefunden
                  </div>
                ) : (
                  <div className="space-y-6">
                    {vehicle.repairs.map((repair) => (
                      <Card key={repair.id} className="bg-muted/30">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">{formatDateString(repair.date)}</CardTitle>
                            <div className="text-sm text-muted-foreground">
                              {repair.duration} {repair.duration === 1 ? 'Tag' : 'Tage'} Ausfallzeit
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm">{repair.description}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                          <div className="text-sm">
                            <span className="font-medium">Gesamtkosten:</span> {repair.totalCost.toFixed(2)} €
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Unternehmen bezahlt:</span> {repair.companyPaidAmount.toFixed(2)} €
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="addRepair">
            <Card>
              <CardHeader>
                <CardTitle>Neue Reparatur</CardTitle>
                <CardDescription>Fügen Sie eine neue Reparatur oder einen Werkstattaufenthalt hinzu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="repair-date">Datum</Label>
                      <Input 
                        id="repair-date" 
                        type="date" 
                        value={newRepair.date}
                        onChange={(e) => setNewRepair({...newRepair, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repair-duration">Dauer (Tage)</Label>
                      <Input 
                        id="repair-duration" 
                        type="number" 
                        min="1"
                        value={newRepair.duration}
                        onChange={(e) => setNewRepair({...newRepair, duration: parseInt(e.target.value) || 1})}
                      />
                    </div>
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
                <Button variant="outline" onClick={() => setActiveTab("workshop")}>Abbrechen</Button>
                <Button onClick={handleAddRepair}>Reparatur hinzufügen</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button>Schließen</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetails;
