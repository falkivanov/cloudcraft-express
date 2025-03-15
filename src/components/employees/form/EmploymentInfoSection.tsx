
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from "./employeeFormSchema";
import TextFormField from "./TextFormField";
import DateFormField from "./DateFormField";

interface EmploymentInfoSectionProps {
  form: UseFormReturn<EmployeeFormData>;
}

const EmploymentInfoSection: React.FC<EmploymentInfoSectionProps> = ({ form }) => {
  return (
    <>
      <TextFormField form={form} name="transporterId" label="Transporter ID" />
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
