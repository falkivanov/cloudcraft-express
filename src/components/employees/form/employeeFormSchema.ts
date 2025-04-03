
import { z } from "zod";

export const employeeFormSchema = z.object({
  name: z.string().min(1, { message: "Name muss angegeben werden" }),
  email: z.string().email({ message: "Gültige E-Mail-Adresse erforderlich" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  status: z.string().optional().or(z.literal("")),
  transporterId: z.string().optional().or(z.literal("")),
  startDate: z.date().optional(),
  endDate: z.date().nullable().optional(),
  address: z.string().optional().or(z.literal("")),
  telegramUsername: z.string().optional().or(z.literal("")),
  workingDaysAWeek: z.coerce.number().min(1).max(7, { message: "Zwischen 1 und 7 Tagen" }),
  preferredVehicle: z.string().optional().or(z.literal("")),
  preferredWorkingDays: z.array(z.string()).optional().default([]),
  wantsToWorkSixDays: z.boolean().optional().default(false),
  isWorkingDaysFlexible: z.boolean().optional().default(true),
  mentorFirstName: z.string().optional().or(z.literal("")),
  mentorLastName: z.string().optional().or(z.literal("")),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
