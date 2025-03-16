
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from "./employeeFormSchema";
import TextFormField from "./TextFormField";

interface PersonalInfoSectionProps {
  form: UseFormReturn<EmployeeFormData>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ form }) => {
  return (
    <>
      <TextFormField form={form} name="name" label="Name" />
      <TextFormField form={form} name="email" label="Email" type="email" />
      <TextFormField form={form} name="phone" label="Telefon" />
      <TextFormField form={form} name="telegramUsername" label="Telegram Username" />
    </>
  );
};

export default PersonalInfoSection;
