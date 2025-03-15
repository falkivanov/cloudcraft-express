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
import { Vehicle, RepairEntry, Appointment } from "@/types/vehicle";
import { format, differenceInDays } from "date-fns";
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
import { Info, Wrench, Calendar, Plus, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  const [isAddingRepair, setIsAddingRepair] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const currentDate = new Date().toISOString().split('T')[0];
  
  const [newRepair, setNewRepair] = useState<Omit<RepairEntry, "id" | "duration" | "date">>({
    startDate: currentDate,
    endDate: currentDate,
    description: "",
    location: "",
    totalCost: 0,
    companyPaidAmount: 0
  });
  
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, "id">>({
    date: currentDate,
    time: "09:00",
    description: "",
    location: "",
    appointmentType: "Inspektion",
    completed: false
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
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

  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(0, differenceInDays(end, start) + 1); // +1 to include both start and end dates
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

    const duration = calculateDuration(newRepair.startDate, newRepair.endDate);
    
    const updatedVehicle = { ...vehicle };
    const repairs = updatedVehicle.repairs || [];
    
    const newRepairEntry: RepairEntry = {
      id: (Date.now().toString()),
      date: newRepair.startDate, // Use startDate as the main date
      ...newRepair,
      duration
    };
    
    updatedVehicle.repairs = [...repairs, newRepairEntry];
    
    onUpdateVehicle(updatedVehicle);
    
    // Reset the form
    setNewRepair({
      startDate: currentDate,
      endDate: currentDate,
      description: "",
      location: "",
      totalCost: 0,
      companyPaidAmount: 0
    });
    
    setIsAddingRepair(false);
    
    toast({
      title: "Reparatur hinzugefügt",
      description: `Reparatur wurde erfolgreich zum Fahrzeug ${vehicle.licensePlate} hinzugefügt.`
    });
  };
  
  const handleAddAppointment = () => {
    if (!vehicle) return;
    
    if (!newAppointment.description.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Beschreibung des Termins ein.",
        variant: "destructive"
      });
      return;
    }

    if (!newAppointment.location.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie den Ort des Termins ein.",
        variant: "destructive"
      });
      return;
    }

    const updatedVehicle = { ...vehicle };
    const appointments = updatedVehicle.appointments || [];
    
    const newAppointmentEntry: Appointment = {
      id: (Date.now().toString()),
      ...newAppointment
    };
    
    updatedVehicle.appointments = [...appointments, newAppointmentEntry];
    
    onUpdateVehicle(updatedVehicle);
    
    // Reset the form
    setNewAppointment({
      date: currentDate,
      time: "09:00",
      description: "",
      location: "",
      appointmentType: "Inspektion",
      completed: false
    });
    
    setIsAddingAppointment(false);
    
    toast({
      title: "Termin hinzugefügt",
      description: `Termin wurde erfolgreich zum Fahrzeug ${vehicle.licensePlate} hinzugefügt.`
    });
  };
  
  const handleCompleteAppointment = (appointmentId: string) => {
    if (!vehicle) return;
    
    const updatedVehicle = { ...vehicle };
    const appointments = updatedVehicle.appointments || [];
    
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, completed: !appointment.completed } 
        : appointment
    );
    
    updatedVehicle.appointments = updatedAppointments;
    
    onUpdateVehicle(updatedVehicle);
    
    const appointment = appointments.find(a => a.id === appointmentId);
    const status = appointment?.completed ? "nicht erledigt" : "erledigt";
    
    toast({
      title: "Terminstatus aktualisiert",
      description: `Der Termin wurde als ${status} markiert.`
    });
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setNewAppointment({
        ...newAppointment,
        date: format(date, 'yyyy-MM-dd')
      });
    }
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
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Termine</span>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Werkstattaufenthalte</h3>
              <Button onClick={() => setIsAddingRepair(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Neue Reparatur
              </Button>
            </div>
            
            {isAddingRepair ? (
              <Card>
                <CardHeader>
                  <CardTitle>Neue Reparatur</CardTitle>
                  <CardDescription>Fügen Sie eine neue Reparatur oder einen Werkstattaufenthalt hinzu</CardDescription>
                </CardHeader>
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
                  <Button variant="outline" onClick={() => setIsAddingRepair(false)}>Abbrechen</Button>
                  <Button onClick={handleAddRepair}>Reparatur hinzufügen</Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
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
                                {repair.location && ` • ${repair.location}`}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm">{repair.description}</p>
                            {repair.startDate && repair.endDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Zeitraum: {formatDateString(repair.startDate)} - {formatDateString(repair.endDate)}
                              </p>
                            )}
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
            )}
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Termine</h3>
              <Button onClick={() => setIsAddingAppointment(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Termin
              </Button>
            </div>
            
            {isAddingAppointment ? (
              <Card>
                <CardHeader>
                  <CardTitle>Neuer Termin</CardTitle>
                  <CardDescription>Vereinbaren Sie einen neuen Termin für das Fahrzeug</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Datum</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {selectedDate ? (
                                format(selectedDate, "dd.MM.yyyy", { locale: de })
                              ) : (
                                <span>Datum wählen</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                              locale={de}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointment-time">Uhrzeit</Label>
                        <Input 
                          id="appointment-time" 
                          type="time" 
                          value={newAppointment.time}
                          onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment-location">Ort</Label>
                      <Input 
                        id="appointment-location" 
                        placeholder="Werkstatt / Ort des Termins"
                        value={newAppointment.location}
                        onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment-type">Art des Termins</Label>
                      <Select 
                        defaultValue={newAppointment.appointmentType}
                        onValueChange={(value: "Inspektion" | "Reparatur" | "Reifenwechsel" | "Sonstiges") => 
                          setNewAppointment({...newAppointment, appointmentType: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Terminart wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inspektion">Inspektion</SelectItem>
                          <SelectItem value="Reparatur">Reparatur</SelectItem>
                          <SelectItem value="Reifenwechsel">Reifenwechsel</SelectItem>
                          <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment-description">Beschreibung</Label>
                      <Textarea 
                        id="appointment-description" 
                        placeholder="Geben Sie Details zum Termin an"
                        value={newAppointment.description}
                        onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingAppointment(false)}>Abbrechen</Button>
                  <Button onClick={handleAddAppointment}>Termin hinzufügen</Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  {!vehicle.appointments || vehicle.appointments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Keine Termine gefunden
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vehicle.appointments.map((appointment) => (
                        <Card key={appointment.id} className={cn("bg-muted/30", appointment.completed && "bg-muted/10")}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-base">
                                  {formatDateString(appointment.date)}, {appointment.time} Uhr
                                </CardTitle>
                                {appointment.completed && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Erledigt
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.appointmentType}
                                {appointment.location && ` • ${appointment.location}`}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm">{appointment.description}</p>
                          </CardContent>
                          <CardFooter className="flex justify-end pt-0">
                            <Button 
                              variant={appointment.completed ? "outline" : "default"} 
                              size="sm"
                              onClick={() => handleCompleteAppointment(appointment.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {appointment.completed ? "Auf nicht erledigt setzen" : "Als erledigt markieren"}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
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
