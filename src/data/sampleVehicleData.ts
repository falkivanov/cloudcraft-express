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
    repairs: [
      ...sampleRepairs,
      {
        id: "13",
        date: format(new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        startDate: format(new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        endDate: format(new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        location: "ATU Frankfurt",
        description: "Inspektion und neue Wischerblätter",
        duration: 1,
        totalCost: 220.50,
        companyPaidAmount: 220.50,
        causeType: "Verschleiß"
      }
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
      {
        id: "14",
        date: format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        startDate: format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        endDate: format(new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        location: "Mercedes Servicecenter",
        description: "Kupplung erneuert und Bremsen geprüft",
        duration: 3,
        totalCost: 1245.80,
        companyPaidAmount: 1245.80,
        causeType: "Verschleiß"
      }
    ],
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
      },
      {
        id: "15",
        date: format(new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        startDate: format(new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        endDate: format(new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        location: "BMW Servicezentrum",
        description: "Software Update und Fehlerdiagnose",
        duration: 1,
        totalCost: 180.00,
        companyPaidAmount: 180.00,
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
      },
      {
        id: "16",
        date: format(new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        startDate: format(new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        endDate: format(new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        location: "Ford Servicecenter",
        description: "Frontscheibe repariert",
        duration: 1,
        totalCost: 350.00,
        companyPaidAmount: 350.00,
        causeType: "Unfall",
        causedByEmployeeId: "4",
        causedByEmployeeName: "Lisa Weber"
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
      },
      {
        id: "17",
        date: format(new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        startDate: format(new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        endDate: format(new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        location: "Mercedes Service Express",
        description: "Fehlerbehebung Elektronik (Klimaanlage)",
        duration: 1,
        totalCost: 320.45,
        companyPaidAmount: 320.45,
        causeType: "Verschleiß"
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
      },
      {
        id: "18",
        date: format(new Date(), "yyyy-MM-dd"),
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
        location: "Tesla Service Center Berlin",
        description: "Wartungsarbeiten Batterie und Elektro-Check",
        duration: 1,
        totalCost: 580.75,
        companyPaidAmount: 580.75,
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
  },
  {
    id: "21",
    licensePlate: "H-TT 3311",
    brand: "Tesla",
    model: "Model Y",
    vinNumber: "7SAYGDEF9NF123456",
    status: "Defleet",
    infleetDate: "2021-03-08",
    defleetDate: "2023-08-15",
    repairs: [],
    appointments: []
  },
  {
    id: "22",
    licensePlate: "KS-LM 6709",
    brand: "Volkswagen",
    model: "ID.3",
    vinNumber: "WVWZZZE1ZMP123456",
    status: "Aktiv",
    infleetDate: "2022-01-18",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "23",
    licensePlate: "B-KJ 4545",
    brand: "Audi",
    model: "A3",
    vinNumber: "WAUZZZGY6NA123456",
    status: "Aktiv",
    infleetDate: "2020-11-25",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "24",
    licensePlate: "K-LM 4466",
    brand: "BMW",
    model: "1er",
    vinNumber: "WBA1C510X0J123456",
    status: "Aktiv",
    infleetDate: "2021-07-21",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "25",
    licensePlate: "F-YZ 1324",
    brand: "Toyota",
    model: "RAV4",
    vinNumber: "JTMRJREV90D123456",
    status: "Aktiv",
    infleetDate: "2022-03-03",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "26",
    licensePlate: "HH-QW 9933",
    brand: "Hyundai",
    model: "Tucson",
    vinNumber: "TMAJ3815BMJ123456",
    status: "Aktiv",
    infleetDate: "2021-02-19",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "27",
    licensePlate: "B-DF 4488",
    brand: "Kia",
    model: "Sportage",
    vinNumber: "U5YPG814BBL123456",
    status: "Aktiv",
    infleetDate: "2022-05-20",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "28",
    licensePlate: "HB-IU 7891",
    brand: "Seat",
    model: "Ateca",
    vinNumber: "VSSZZZ5FZLR123456",
    status: "Aktiv",
    infleetDate: "2021-09-14",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "29",
    licensePlate: "S-OP 8766",
    brand: "Skoda",
    model: "Kodiaq",
    vinNumber: "TMBLC7NS1L8123456",
    status: "Aktiv",
    infleetDate: "2022-01-31",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "30",
    licensePlate: "HH-BB 3322",
    brand: "Ford",
    model: "Puma",
    vinNumber: "WF0JXXGAHJNA123456",
    status: "Aktiv",
    infleetDate: "2021-05-06",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "31",
    licensePlate: "B-GH 6755",
    brand: "Renault",
    model: "Captur",
    vinNumber: "VF12RJA00CC123456",
    status: "Aktiv",
    infleetDate: "2022-04-19",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "32",
    licensePlate: "F-JK 2233",
    brand: "Peugeot",
    model: "3008",
    vinNumber: "VF3MRHPJ0KJ123456",
    status: "Aktiv",
    infleetDate: "2021-11-08",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "33",
    licensePlate: "ST-WW 7845",
    brand: "Volvo",
    model: "XC40",
    vinNumber: "YV1XZA88AJ2123456",
    status: "Aktiv",
    infleetDate: "2022-02-14",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "34",
    licensePlate: "K-ZZ 9900",
    brand: "Mazda",
    model: "CX-5",
    vinNumber: "JMZKFV88W00123456",
    status: "Aktiv",
    infleetDate: "2021-01-22",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "35",
    licensePlate: "DD-KT 4354",
    brand: "Nissan",
    model: "Qashqai",
    vinNumber: "SJNFAAJ11EU123456",
    status: "Defleet",
    infleetDate: "2020-09-10",
    defleetDate: "2023-10-05",
    repairs: [],
    appointments: []
  },
  {
    id: "36",
    licensePlate: "B-VB 1245",
    brand: "Opel",
    model: "Grandland",
    vinNumber: "W0VZRF7A1LT123456",
    status: "Aktiv",
    infleetDate: "2022-03-25",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "37",
    licensePlate: "B-SD 6677",
    brand: "Citroen",
    model: "C5 Aircross",
    vinNumber: "VR7ARHNZKLT123456",
    status: "Aktiv",
    infleetDate: "2021-08-31",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "38",
    licensePlate: "M-RT 5667",
    brand: "Seat",
    model: "Tarraco",
    vinNumber: "VSSZZZ5FZKR123456",
    status: "Aktiv",
    infleetDate: "2022-01-12",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "39",
    licensePlate: "F-MM 4554",
    brand: "Skoda",
    model: "Karoq",
    vinNumber: "TMBJJ7NS5KD123456",
    status: "Aktiv",
    infleetDate: "2021-05-17",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "40",
    licensePlate: "HH-FW 9081",
    brand: "Jeep",
    model: "Compass",
    vinNumber: "3C4NJDCB9LT123456",
    status: "Aktiv",
    infleetDate: "2022-06-02",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "41",
    licensePlate: "D-CC 4578",
    brand: "Mitsubishi",
    model: "Eclipse Cross",
    vinNumber: "JMBXDGG2WNZ123456",
    status: "Aktiv",
    infleetDate: "2021-03-29",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "42",
    licensePlate: "B-HW 7714",
    brand: "Suzuki",
    model: "Vitara",
    vinNumber: "JSALYGA78V0123456",
    status: "Aktiv",
    infleetDate: "2022-04-28",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "43",
    licensePlate: "HB-EE 1256",
    brand: "Dacia",
    model: "Duster",
    vinNumber: "UU1HSDCVG78123456",
    status: "Aktiv",
    infleetDate: "2021-07-15",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "44",
    licensePlate: "B-TH 7834",
    brand: "Audi",
    model: "Q5",
    vinNumber: "WAUZZZFY6N0123456",
    status: "Aktiv",
    infleetDate: "2022-03-11",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "45",
    licensePlate: "K-BJ 5511",
    brand: "Mercedes",
    model: "GLB",
    vinNumber: "W1N2479761F123456",
    status: "Aktiv",
    infleetDate: "2021-11-29",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "46",
    licensePlate: "F-RD 6622",
    brand: "BMW",
    model: "X1",
    vinNumber: "WBAHU7109L0123456",
    status: "Aktiv",
    infleetDate: "2022-02-07",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "47",
    licensePlate: "B-NJ 9988",
    brand: "Volkswagen",
    model: "Taigo",
    vinNumber: "WVGZZZA1ZNP789012",
    status: "Aktiv",
    infleetDate: "2021-10-18",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "48",
    licensePlate: "HH-MN 3344",
    brand: "Toyota",
    model: "Corolla Cross",
    vinNumber: "JTMDX3FV60N123456",
    status: "Aktiv",
    infleetDate: "2022-05-16",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "49",
    licensePlate: "D-LC 7788",
    brand: "Hyundai",
    model: "Kona",
    vinNumber: "TMAK3812GMJ123456",
    status: "Aktiv",
    infleetDate: "2021-12-06",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "50",
    licensePlate: "B-QA 2468",
    brand: "Kia",
    model: "Niro",
    vinNumber: "KNACC81CBN5123456",
    status: "Aktiv",
    infleetDate: "2022-01-03",
    defleetDate: null,
    repairs: [],
    appointments: []
  }
];

