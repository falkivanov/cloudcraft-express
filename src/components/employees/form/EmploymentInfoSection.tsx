
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from "./employeeFormSchema";
import TextFormField from "./TextFormField";
import DateFormField from "./DateFormField";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EmploymentInfoSectionProps {
  form: UseFormReturn<EmployeeFormData>;
}

const EmploymentInfoSection: React.FC<EmploymentInfoSectionProps> = ({ form }) => {
  return (
    <>
      <TextFormField form={form} name="transporterId" label="Transporter ID" />
      
      {/* Mentor-Informationen direkt unter der Transporter ID */}
      <FormField
        control={form.control}
        name="mentorFirstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mentor Vorname</FormLabel>
            <FormControl>
              <Input placeholder="Vorname des Mentors" {...field} value={field.value || ""} />
            </FormControl>
            <FormDescription>
              Der Vorname des zugewiesenen Mentors
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="mentorLastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mentor Nachname</FormLabel>
            <FormControl>
              <Input placeholder="Nachname des Mentors" {...field} value={field.value || ""} />
            </FormControl>
            <FormDescription>
              Der Nachname des zugewiesenen Mentors
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <DateFormField 
        form={form} 
        name="startDate" 
        label="Startdatum" 
        disableFutureDates={true} 
      />
      <DateFormField 
        form={form} 
        name="endDate" 
        label="Enddatum" 
        isOptional={true} 
      />
    </>
  );
};

export default EmploymentInfoSection;
