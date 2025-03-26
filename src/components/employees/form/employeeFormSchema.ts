
import { z } from "zod";

export const employeeFormSchema = z.object({
  name: z.string().min(1, { message: "Name muss angegeben werden" }),
  email: z.string().email({ message: "Gültige E-Mail-Adresse erforderlich" }),
  phone: z.string().min(1, { message: "Telefonnummer muss angegeben werden" }),
  status: z.string().min(1, { message: "Status muss angegeben werden" }),
  transporterId: z.string().min(1, { message: "Transporter ID muss angegeben werden" }),
  startDate: z.date({ required_error: "Startdatum muss angegeben werden" }),
  endDate: z.date().nullable().optional(),
  address: z.string().min(1, { message: "Adresse muss angegeben werden" }),
  telegramUsername: z.string().optional(),
  workingDaysAWeek: z.coerce.number().min(1).max(7, { message: "Zwischen 1 und 7 Tagen" }),
  preferredVehicle: z.string().min(1, { message: "Bevorzugtes Fahrzeug muss angegeben werden" }),
  preferredWorkingDays: z.array(z.string()).optional().default([]),
  wantsToWorkSixDays: z.boolean().optional().default(false),
  isWorkingDaysFlexible: z.boolean().optional().default(true),
  mentorFirstName: z.string().optional(),
  mentorLastName: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
