
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Vehicle, Appointment } from "@/types/vehicle";
import { parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import AppointmentForm from "./AppointmentForm";
import AppointmentList from "./AppointmentList";

interface AppointmentsTabProps {
  vehicle: Vehicle;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const AppointmentsTab = ({ vehicle, onUpdateVehicle }: AppointmentsTabProps) => {
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const { toast } = useToast();
  
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, "id">>({
    date: currentDate,
    time: "09:00",
    description: "",
    location: "",
    appointmentType: "Inspektion",
    completed: false
  });

  const sortedAppointments = React.useMemo(() => {
    if (!vehicle?.appointments) return [];
    return [...vehicle.appointments].sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return a.time.localeCompare(b.time);
    });
  }, [vehicle?.appointments]);

  const handleAddAppointment = () => {
    const updatedVehicle = { ...vehicle };
    const appointments = updatedVehicle.appointments || [];
    
    const newAppointmentEntry: Appointment = {
      id: (Date.now().toString()),
      ...newAppointment
    };
    
    updatedVehicle.appointments = [...appointments, newAppointmentEntry];
    
    onUpdateVehicle(updatedVehicle);
    
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Termine</h3>
        <Button onClick={() => setIsAddingAppointment(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Termin
        </Button>
      </div>
      
      {isAddingAppointment ? (
        <AppointmentForm 
          newAppointment={newAppointment}
          setNewAppointment={setNewAppointment}
          onCancel={() => setIsAddingAppointment(false)}
          onSubmit={handleAddAppointment}
        />
      ) : (
        <AppointmentList 
          appointments={sortedAppointments}
          onCompleteToggle={handleCompleteAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentsTab;
