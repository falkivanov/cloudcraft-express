
import { Employee } from "@/types/employee";

// Beispieldaten für Mitarbeiter
export const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Max Mustermann",
    email: "max.mustermann@beispiel.de",
    phone: "+49 123 4567890",
    status: "Aktiv",
    transporterId: "TR-001",
    startDate: "2020-01-15",
    endDate: null,
    address: "Hauptstraße 1, 10115 Berlin",
    telegramUsername: "@maxmuster",
    workingDaysAWeek: 5,
    preferredVehicle: "B-AB 1234", // Changed from BMW X5 to license plate
    preferredWorkingDays: ["Mo", "Di", "Mi", "Do", "Fr"],
    wantsToWorkSixDays: false,
    isWorkingDaysFlexible: true
  },
  {
    id: "2",
    name: "Anna Schmidt",
    email: "anna.schmidt@beispiel.de",
    phone: "+49 123 4567891",
    status: "Aktiv",
    transporterId: "TR-002",
    startDate: "2019-08-01",
    endDate: null,
    address: "Lindenstraße 25, 10969 Berlin",
    telegramUsername: "@annaschmidt",
    workingDaysAWeek: 5,
    preferredVehicle: "M-CD 5678", // Changed from VW Golf to license plate
    preferredWorkingDays: ["Mo", "Di", "Do", "Fr", "Sa"],
    wantsToWorkSixDays: true,
    isWorkingDaysFlexible: true
  },
  {
    id: "3",
    name: "Thomas Weber",
    email: "thomas.weber@beispiel.de",
    phone: "+49 123 4567892",
    status: "Aktiv",
    transporterId: "TR-003",
    startDate: "2018-03-01",
    endDate: null,
    address: "Friedrichstraße 123, 10117 Berlin",
    telegramUsername: "",
    workingDaysAWeek: 5,
    preferredVehicle: "K-EF 9012", // Changed from Mercedes C-Klasse to license plate
    preferredWorkingDays: ["Mo", "Di", "Mi", "Do", "Fr"],
    wantsToWorkSixDays: false,
    isWorkingDaysFlexible: true
  },
  {
    id: "4",
    name: "Lisa Becker",
    email: "lisa.becker@beispiel.de",
    phone: "+49 123 4567893",
    status: "Urlaub",
    transporterId: "TR-004",
    startDate: "2021-06-15",
    endDate: null,
    address: "Kurfürstendamm 234, 10719 Berlin",
    telegramUsername: "@lisabecker",
    workingDaysAWeek: 4,
    preferredVehicle: "F-GH 3456", // Changed from Audi A4 to license plate
    preferredWorkingDays: ["Di", "Mi", "Do", "Fr"],
    wantsToWorkSixDays: false,
    isWorkingDaysFlexible: true
  },
  {
    id: "5",
    name: "Michael Schulz",
    email: "michael.schulz@beispiel.de",
    phone: "+49 123 4567894",
    status: "Aktiv",
    transporterId: "TR-005",
    startDate: "2017-11-01",
    endDate: null,
    address: "Alexanderplatz 5, 10178 Berlin",
    telegramUsername: "@mschulz",
    workingDaysAWeek: 5,
    preferredVehicle: "HH-IJ 7890", // Changed from Opel Astra to license plate
    preferredWorkingDays: ["Mo", "Di", "Mi", "Do", "Fr"],
    wantsToWorkSixDays: true,
    isWorkingDaysFlexible: true
  },
  // Minijobber, der nur Samstags arbeiten kann
  {
    id: "7",
    name: "Julia Fischer",
    email: "julia.fischer@beispiel.de",
    phone: "+49 123 4567896",
    status: "Aktiv",
    transporterId: "TR-007",
    startDate: "2022-03-01",
    endDate: null,
    address: "Schillerstraße 42, 10625 Berlin",
    telegramUsername: "@juliafischer",
    workingDaysAWeek: 1,
    preferredVehicle: "B-MK 4321", // Changed from Mini Cooper to license plate
    preferredWorkingDays: ["Sa"],
    wantsToWorkSixDays: false,
    isWorkingDaysFlexible: false
  },
  // Ehemalige Mitarbeiter
  {
    id: "6",
    name: "Sarah Meyer",
    email: "sarah.meyer@beispiel.de",
    phone: "+49 123 4567895",
    status: "Inaktiv",
    transporterId: "TR-006",
    startDate: "2018-05-01",
    endDate: "2023-12-31",
    address: "Musterstraße 42, 10115 Berlin",
    telegramUsername: "@sarahmeyer",
    workingDaysAWeek: 5,
    preferredVehicle: "F-BZ 3421", // Changed from BMW 3er to license plate
    preferredWorkingDays: ["Mo", "Mi", "Do", "Fr", "Sa"],
    wantsToWorkSixDays: false,
    isWorkingDaysFlexible: true
  }
];
