
import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import TargetFormItem from "./TargetFormItem";
import { FormValues } from "./ScorecardTargetForm";
import { KPI_CATEGORIES } from "./useScorecardTargetForm";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
        {/* Global gültig ab Feld */}
        <FormField
          control={form.control}
          name="validFrom"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="font-medium mb-1">Gültig ab</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={!isEditing}
                    >
                      {field.value ? (
                        format(new Date(field.value), "dd.MM.yyyy", { locale: de })
                      ) : (
                        <span>Datum auswählen</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

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
