
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EmployeeFormData } from "./employeeFormSchema";

interface MentorInfoSectionProps {
  form: UseFormReturn<EmployeeFormData>;
}

const MentorInfoSection: React.FC<MentorInfoSectionProps> = ({ form }) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Mentor Information</h3>
      
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
    </div>
  );
};

export default MentorInfoSection;
