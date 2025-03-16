
import { Vehicle, RepairEntry, Appointment } from "@/types/vehicle";
import { format } from "date-fns";

// More repair entries for better stats visualization
export const sampleRepairs: RepairEntry[] = [
  {
    id: "1",
    date: "2023-05-10",
    startDate: "2023-05-10",
    endDate: "2023-05-10",
    location: "ATU Frankfurt",
    description: "Ölwechsel und Inspektion",
    duration: 1,
    totalCost: 350.00,
    companyPaidAmount: 350.00,
    causeType: "Verschleiß"
  },
  {
    id: "2",
    date: "2023-08-22",
    startDate: "2023-08-22",
    endDate: "2023-08-23",
    location: "Mercedes Werkstatt Berlin",
    description: "Bremsen vorne erneuert",
    duration: 2,
    totalCost: 520.75,
    companyPaidAmount: 450.00,
    causeType: "Verschleiß"
  }
];

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
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: "1",
    licensePlate: "B-AB 1234",
    brand: "BMW",
    model: "X5",
    vinNumber: "WBAKV210900J39048",
    status: "Aktiv",
    infleetDate: "2021-05-15",
    defleetDate: null,
    repairs: sampleRepairs,
    appointments: sampleAppointments
  },
  {
    id: "2",
    licensePlate: "M-CD 5678",
    brand: "Mercedes",
    model: "C-Klasse",
    vinNumber: "WDDWJ4JB9KF089367",
    status: "Aktiv",
    infleetDate: "2020-10-23",
    defleetDate: null,
    repairs: [],
    appointments: [
      {
        id: "4",
        date: format(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        time: "11:00",
        location: "Mercedes Service Center",
        description: "Inspektion nach Herstellervorgaben",
        appointmentType: "Inspektion",
        completed: false
      }
    ]
  },
  {
    id: "3",
    licensePlate: "K-EF 9012",
    brand: "Volkswagen",
    model: "Golf",
    vinNumber: "WVWZZZ1KZAM654321",
    status: "Aktiv",
    infleetDate: "2022-03-07",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "4",
    licensePlate: "F-GH 3456",
    brand: "Audi",
    model: "A4",
    vinNumber: "WAUZZZ8E57A123456",
    status: "Defleet",
    infleetDate: "2019-08-12",
    defleetDate: "2023-01-20",
    repairs: [],
    appointments: []
  },
  {
    id: "5",
    licensePlate: "HH-IJ 7890",
    brand: "Opel",
    model: "Astra",
    vinNumber: "W0L0AHL3572123456",
    status: "In Werkstatt",
    infleetDate: "2021-11-30",
    defleetDate: null,
    repairs: [
      {
        id: "3",
        date: "2023-11-15",
        startDate: "2023-11-15",
        endDate: "2023-11-29",
        location: "Opel Servicecenter Hamburg",
        description: "Getriebeschaden, kompletter Austausch notwendig",
        duration: 14,
        totalCost: 4800.00,
        companyPaidAmount: 3000.00,
        causeType: "Verschleiß"
      }
    ],
    appointments: []
  },
  // Adding more vehicles with repair histories for better dashboard data
  {
    id: "6",
    licensePlate: "B-MK 4321",
    brand: "BMW",
    model: "3er",
    vinNumber: "WBASP2C00BC337421",
    status: "Aktiv",
    infleetDate: "2022-02-12",
    defleetDate: null,
    repairs: [
      {
        id: "4",
        date: "2023-12-05",
        startDate: "2023-12-05",
        endDate: "2023-12-07",
        location: "BMW Service München",
        description: "Austausch Kühlwasserpumpe",
        duration: 3,
        totalCost: 780.50,
        companyPaidAmount: 780.50,
        causeType: "Verschleiß"
      },
      {
        id: "5",
        date: "2024-02-10",
        startDate: "2024-02-10",
        endDate: "2024-02-10",
        location: "Reifenhändler Berlin",
        description: "Reifenwechsel Winter auf Sommer",
        duration: 1,
        totalCost: 120.00,
        companyPaidAmount: 120.00,
        causeType: "Verschleiß"
      }
    ],
    appointments: []
  },
  {
    id: "7",
    licensePlate: "K-FG 6754",
    brand: "Ford",
    model: "Kuga",
    vinNumber: "WF05XXGCC5FR12345",
    status: "Aktiv",
    infleetDate: "2021-06-17",
    defleetDate: null,
    repairs: [
      {
        id: "6",
        date: "2023-10-12",
        startDate: "2023-10-12",
        endDate: "2023-10-14",
        location: "Ford Werkstatt Köln",
        description: "Austausch Stoßdämpfer vorne",
        duration: 3,
        totalCost: 640.30,
        companyPaidAmount: 640.30,
        causeType: "Verschleiß"
      }
    ],
    appointments: []
  },
  {
    id: "8",
    licensePlate: "M-VW 9876",
    brand: "Volkswagen",
    model: "Passat",
    vinNumber: "WVWZZZ3CZKE123456",
    status: "In Werkstatt",
    infleetDate: "2022-08-05",
    defleetDate: null,
    repairs: [
      {
        id: "7",
        date: "2024-03-05",
        startDate: "2024-03-05",
        endDate: "2024-03-18",
        location: "VW Zentrum München",
        description: "Motorschaden, Zylinderkopfdichtung defekt",
        duration: 14,
        totalCost: 3850.00,
        companyPaidAmount: 3850.00,
        causeType: "Verschleiß"
      }
    ],
    appointments: []
  },
  {
    id: "9",
    licensePlate: "F-BZ 3421",
    brand: "Mercedes",
    model: "E-Klasse",
    vinNumber: "WDD2130841A123456",
    status: "Aktiv",
    infleetDate: "2020-11-23",
    defleetDate: null,
    repairs: [
      {
        id: "8",
        date: "2023-09-28",
        startDate: "2023-09-28",
        endDate: "2023-09-30",
        location: "Mercedes Niederlassung Frankfurt",
        description: "Inspektion und Bremsen hinten erneuert",
        duration: 3,
        totalCost: 920.15,
        companyPaidAmount: 920.15,
        causeType: "Verschleiß"
      },
      {
        id: "9",
        date: "2024-01-15",
        startDate: "2024-01-15",
        endDate: "2024-01-18",
        location: "Karosserie Wagner",
        description: "Unfallschaden vorne rechts",
        duration: 4,
        totalCost: 2350.00,
        companyPaidAmount: 500.00,
        causeType: "Unfall",
        causedByEmployeeId: "2",
        causedByEmployeeName: "Max Mustermann"
      }
    ],
    appointments: []
  },
  {
    id: "10",
    licensePlate: "B-TX 7890",
    brand: "Tesla",
    model: "Model 3",
    vinNumber: "5YJ3E1EAXLF123456",
    status: "Aktiv",
    infleetDate: "2023-01-08",
    defleetDate: null,
    repairs: [
      {
        id: "10",
        date: "2024-02-25",
        startDate: "2024-02-25",
        endDate: "2024-02-28",
        location: "Tesla Service Center Berlin",
        description: "Software-Update und Fehlerbehebung Infotainment",
        duration: 4,
        totalCost: 0.00,
        companyPaidAmount: 0.00,
        causeType: "Verschleiß"
      }
    ],
    appointments: []
  },
  {
    id: "11",
    licensePlate: "HH-XY 4523",
    brand: "Audi",
    model: "Q5",
    vinNumber: "WAUZZZ8R7DA123456",
    status: "Aktiv",
    infleetDate: "2021-09-14",
    defleetDate: null,
    repairs: [
      {
        id: "11",
        date: "2023-07-05",
        startDate: "2023-07-05",
        endDate: "2023-07-05",
        location: "Audi Zentrum Hamburg",
        description: "Wartung nach Herstellervorgaben",
        duration: 1,
        totalCost: 490.35,
        companyPaidAmount: 490.35,
        causeType: "Verschleiß"
      },
      {
        id: "12",
        date: "2023-11-20",
        startDate: "2023-11-20",
        endDate: "2023-11-24",
        location: "Lackierzentrum Nord",
        description: "Lackschaden Beifahrertür ausbessern",
        duration: 5,
        totalCost: 1250.00,
        companyPaidAmount: 250.00,
        causeType: "Unfall",
        causedByEmployeeId: "3",
        causedByEmployeeName: "Anna Schmidt"
      }
    ],
    appointments: []
  }
];
