
import { Appointment } from "@/types/vehicle";
import { format } from "date-fns";

export const sampleAppointments: Appointment[] = [
  {
    id: "1",
    date: "2023-12-15",
    time: "10:30",
    location: "BMW Service Center",
    description: "Jahresinspektion",
    appointmentType: "Inspektion",
    completed: true
  },
  {
    id: "2",
    date: "2024-02-10",
    time: "14:00",
    location: "Reifendienst Schmidt",
    description: "Winterreifen wechseln",
    appointmentType: "Reifenwechsel",
    completed: false
  },
  {
    id: "3",
    date: format(new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    time: "09:15",
    location: "Autohaus Wagner",
    description: "Softwareupdate Navigationssystem",
    appointmentType: "Sonstiges",
    completed: false
  },
  {
    id: "4",
    date: format(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    time: "11:00",
    location: "Mercedes Service Center",
    description: "Inspektion nach Herstellervorgaben",
    appointmentType: "Inspektion",
    completed: false
  }
];
