
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
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel
}) => {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      ...employee,
      startDate: new Date(employee.startDate),
      endDate: employee.endDate ? new Date(employee.endDate) : null,
      birthday: new Date(employee.birthday),
      workingDaysAWeek: employee.workingDaysAWeek,
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

        <EmployeeFormActions onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default EmployeeForm;
