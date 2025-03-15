
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AppointmentFormProps {
  newAppointment: {
    date: string;
    time: string;
    description: string;
    location: string;
    appointmentType: "Inspektion" | "Reparatur" | "Reifenwechsel" | "Sonstiges";
    completed: boolean;
  };
  setNewAppointment: React.Dispatch<React.SetStateAction<{
    date: string;
    time: string;
    description: string;
    location: string;
    appointmentType: "Inspektion" | "Reparatur" | "Reifenwechsel" | "Sonstiges";
    completed: boolean;
  }>>;
  onCancel: () => void;
  onSubmit: () => void;
}

const AppointmentForm = ({ newAppointment, setNewAppointment, onCancel, onSubmit }: AppointmentFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setNewAppointment({
        ...newAppointment,
        date: format(date, 'yyyy-MM-dd')
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neuer Termin</CardTitle>
        <CardDescription>Vereinbaren Sie einen neuen Termin für das Fahrzeug</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
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
          <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
          <Button type="submit">Termin hinzufügen</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AppointmentForm;
