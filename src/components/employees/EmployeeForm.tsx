
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Employee } from "@/types/employee";
import { Form } from "@/components/ui/form";
import { employeeFormSchema, EmployeeFormData } from "./form/employeeFormSchema";
import PersonalInfoSection from "./form/PersonalInfoSection";
import EmploymentInfoSection from "./form/EmploymentInfoSection";
import AdditionalInfoSection from "./form/AdditionalInfoSection";
import EmployeeFormActions from "./form/EmployeeFormActions";

interface EmployeeFormProps {
  employee: Employee;
  onSubmit: (data: Employee) => void;
  onCancel: () => void;
  isNewEmployee?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel,
  isNewEmployee = false
}) => {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      ...employee,
      startDate: employee.startDate ? new Date(employee.startDate) : new Date(),
      endDate: employee.endDate ? new Date(employee.endDate) : null,
      birthday: employee.birthday ? new Date(employee.birthday) : undefined,
      workingDaysAWeek: employee.workingDaysAWeek || 5,
    },
  });

  const handleSubmit = (data: EmployeeFormData) => {
    onSubmit({
      ...employee,
      ...data,
      startDate: data.startDate.toISOString().split("T")[0],
      endDate: data.endDate ? data.endDate.toISOString().split("T")[0] : null,
      birthday: data.birthday.toISOString().split("T")[0],
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PersonalInfoSection form={form} />
          <EmploymentInfoSection form={form} />
          <AdditionalInfoSection form={form} />
        </div>

        <EmployeeFormActions onCancel={onCancel} submitLabel={isNewEmployee ? "Hinzufügen" : "Speichern"} />
      </form>
    </Form>
  );
};

export default EmployeeForm;
