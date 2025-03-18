
import { Vehicle } from "@/types/vehicle";
import { sampleRepairs } from "./sampleRepairs";
import { sampleAppointments } from "./sampleAppointments";

// First batch of active vehicles (1-20)
export const activeVehiclesBatch1: Vehicle[] = [
  {
    id: "1",
    licensePlate: "B-AB 1234",
    brand: "BMW",
    model: "X5",
    vinNumber: "WBAKV210900J39048",
    status: "Aktiv",
    infleetDate: "2021-05-15",
    defleetDate: null,
    repairs: [
      ...sampleRepairs.filter(repair => repair.id === "1" || repair.id === "2" || repair.id === "13")
    ],
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
    repairs: [
      ...sampleRepairs.filter(repair => repair.id === "14")
    ],
    appointments: [
      sampleAppointments.find(appointment => appointment.id === "4")!
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
    id: "6",
    licensePlate: "B-MK 4321",
    brand: "BMW",
    model: "3er",
    vinNumber: "WBASP2C00BC337421",
    status: "Aktiv",
    infleetDate: "2022-02-12",
    defleetDate: null,
    repairs: [
      ...sampleRepairs.filter(repair => repair.id === "4" || repair.id === "5" || repair.id === "15")
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
      ...sampleRepairs.filter(repair => repair.id === "6" || repair.id === "16")
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
      ...sampleRepairs.filter(repair => repair.id === "8" || repair.id === "9" || repair.id === "17")
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
      ...sampleRepairs.filter(repair => repair.id === "10" || repair.id === "18")
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
      ...sampleRepairs.filter(repair => repair.id === "11" || repair.id === "12")
    ],
    appointments: []
  },
  {
    id: "12",
    licensePlate: "B-WQ 5432",
    brand: "Volkswagen",
    model: "Tiguan",
    vinNumber: "WVGZZZ5NZLW123456",
    status: "Aktiv",
    infleetDate: "2022-01-10",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "13",
    licensePlate: "B-ZT 5678",
    brand: "Audi",
    model: "Q3",
    vinNumber: "WAUZZZ8U1ER123456",
    status: "Aktiv",
    infleetDate: "2021-04-22",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "14",
    licensePlate: "S-QR 1324",
    brand: "Mercedes",
    model: "GLA",
    vinNumber: "WDC1569431J123456",
    status: "Aktiv",
    infleetDate: "2022-03-15",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "15",
    licensePlate: "B-AB 3456",
    brand: "BMW",
    model: "X3",
    vinNumber: "WBSKG910X0L123456",
    status: "Aktiv",
    infleetDate: "2021-11-11",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "16",
    licensePlate: "HB-AR 7814",
    brand: "Volkswagen",
    model: "ID.4",
    vinNumber: "WVWZZZE2ZMP123456",
    status: "Aktiv",
    infleetDate: "2022-05-05",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "17",
    licensePlate: "D-VW 1122",
    brand: "Volkswagen",
    model: "T-Roc",
    vinNumber: "WVGZZZA1ZNP123456",
    status: "Aktiv",
    infleetDate: "2021-08-19",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "18",
    licensePlate: "B-CD 7890",
    brand: "Audi",
    model: "e-tron",
    vinNumber: "WAUZZZGE4MB123456",
    status: "Aktiv",
    infleetDate: "2022-02-28",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "19",
    licensePlate: "M-AA 4567",
    brand: "BMW",
    model: "i4",
    vinNumber: "WBY1Z81070V123456",
    status: "Aktiv",
    infleetDate: "2021-06-14",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "20",
    licensePlate: "F-DD 9876",
    brand: "Mercedes",
    model: "EQA",
    vinNumber: "WDC2539561F123456",
    status: "Aktiv",
    infleetDate: "2022-04-11",
    defleetDate: null,
    repairs: [],
    appointments: []
  }
];

// Vehicles in workshop
export const workshopVehicles: Vehicle[] = [
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
      ...sampleRepairs.filter(repair => repair.id === "3")
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
      ...sampleRepairs.filter(repair => repair.id === "7")
    ],
    appointments: []
  }
];
