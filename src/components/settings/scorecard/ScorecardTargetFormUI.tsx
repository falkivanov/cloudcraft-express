import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import TargetFormItem from "./TargetFormItem";
import { FormValues, ProcessedTarget } from "./ScorecardTargetForm";
import { KPI_CATEGORIES } from "./useScorecardTargetForm";

interface ScorecardTargetFormUIProps {
  form: any;
  isEditing: boolean;
  onSubmit: (data: FormValues) => void;
  findTargetIndex: (name: string) => number;
  setIsEditing: (val: boolean) => void;
  accordionValue: string[];
  setAccordionValue: (val: string[]) => void;
}

const ScorecardTargetFormUI: React.FC<ScorecardTargetFormUIProps> = ({
  form,
  isEditing,
  onSubmit,
  findTargetIndex,
  setIsEditing,
  accordionValue,
  setAccordionValue,
}) => {
  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        autoComplete="off"
      >
        <Accordion 
          type="multiple" 
          className="w-full" 
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          {KPI_CATEGORIES.map(category => (
            <AccordionItem key={category.label} value={category.label} className="border rounded-lg mb-2">
              <AccordionTrigger className="px-4 py-2 font-semibold text-base bg-gray-50 hover:bg-gray-100 rounded-t-lg">
                {category.label}
              </AccordionTrigger>
              <AccordionContent className="space-y-3 p-4 bg-white">
                {category.kpis.map(kpi => {
                  const idx = findTargetIndex(kpi.name);
                  if (idx === -1) return null;
                  return (
                    <TargetFormItem
                      key={kpi.name}
                      form={form}
                      index={idx}
                      metric={form.getValues().targets[idx]}
                      isEditing={isEditing}
                    />
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {isEditing ? (
          <Button type="submit" className="mt-4 w-full">Zielwerte speichern</Button>
        ) : (
          <Button 
            type="button" 
            className="mt-4 w-full"
            onClick={(e) => {
              e.preventDefault();
              setIsEditing(true);
            }}
          >
            Zielwerte anpassen
          </Button>
        )}
      </form>
    </Form>
  );
};

export default ScorecardTargetFormUI;
