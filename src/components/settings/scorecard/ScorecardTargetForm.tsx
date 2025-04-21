
import React, { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { TargetDefinition } from "@/components/quality/scorecard/utils/helpers/statusHelper";
import TargetFormItem from "./TargetFormItem";

// KPI-Definitionen gruppiert nach Kategorie
const KPI_CATEGORIES: { 
  label: string, 
  kpis: TargetDefinition[] 
}[] = [
  {
    label: "Safety",
    kpis: [
      { name: "Vehicle Audit (VSA) Compliance", value: 95, unit: "%" },
      { name: "Safe Driving Metric (FICO)", value: 800, unit: "" },
      { name: "DVIC Compliance", value: 95, unit: "%" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 10, unit: "" },
      { name: "Mentor Adoption Rate", value: 80, unit: "%" },
    ]
  },
  {
    label: "Compliance",
    kpis: [
      { name: "Breach of Contract (BOC)", value: 0, unit: "" },
      { name: "Working Hours Compliance (WHC)", value: 100, unit: "%" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, unit: "%" }
    ]
  },
  {
    label: "Customer",
    kpis: [
      { name: "Customer escalation DPMO", value: 3500, unit: "DPMO" },
      { name: "Customer Delivery Feedback", value: 85, unit: "%" }
    ]
  },
  {
    label: "Quality",
    kpis: [
      { name: "Delivery Completion Rate (DCR)", value: 98.0, unit: "%" },
      { name: "Delivered Not Received (DNR DPMO)", value: 3000, unit: "DPMO" },
      { name: "Lost on Road (LoR) DPMO", value: 350, unit: "DPMO" },
    ]
  },
  {
    label: "Standard Work",
    kpis: [
      { name: "Photo-On-Delivery", value: 95, unit: "%" },
      { name: "Contact Compliance", value: 95, unit: "%" },
    ]
  },
  {
    label: "Capacity",
    kpis: [
      { name: "Next Day Capacity Reliability", value: 98, unit: "%" },
      { name: "Capacity Reliability", value: 98, unit: "%" }
    ]
  }
];

// Flache Liste aller KPIs für Mapping & Form-Initialisierung
const COMPANY_KPI_TARGETS: TargetDefinition[] = KPI_CATEGORIES.flatMap(cat => cat.kpis);

const targetItemSchema = z.object({
  name: z.string(),
  value: z.number().min(0),
  unit: z.string().default(""),
  effectiveFromWeek: z.number().min(1).max(53).optional(),
  effectiveFromYear: z.number().min(2020).max(2030).optional(),
});

const formSchema = z.object({
  targets: z.array(targetItemSchema)
});

export type TargetItem = z.infer<typeof targetItemSchema>;
export type FormValues = z.infer<typeof formSchema>;
export type ProcessedTarget = {
  name: string;
  value: number;
  unit: string;
  effectiveFromWeek?: number;
  effectiveFromYear?: number;
};

interface ScorecardTargetFormProps {
  onSubmit: (data: FormValues) => void;
}

const ScorecardTargetForm: React.FC<ScorecardTargetFormProps> = ({ onSubmit }) => {
  const STORAGE_KEY = "scorecard_custom_targets";
  const [showEffectiveDate, setShowEffectiveDate] = useState<{[key: string]: boolean}>({});
  
  // Initialisiere das Formular mit Defaultwerten
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targets: COMPANY_KPI_TARGETS.map(target => ({
        name: target.name,
        value: target.value,
        unit: target.unit || ""
      }))
    }
  });

  // Geladene Targets in Formular übernehmen & EffectiveDate-Status setzen
  useEffect(() => {
    const savedTargets = localStorage.getItem(STORAGE_KEY);
    if (savedTargets) {
      try {
        const parsedTargets = JSON.parse(savedTargets);
        form.reset({ targets: parsedTargets });
        
        const effectiveDates: {[key: string]: boolean} = {};
        parsedTargets.forEach((target: TargetDefinition) => {
          effectiveDates[target.name] = !!target.effectiveFromWeek && !!target.effectiveFromYear;
        });
        setShowEffectiveDate(effectiveDates);
      } catch (error) {
        console.error("Error loading saved targets:", error);
      }
    }
  }, [form]);

  // Toggle für Gültig-ab Felder
  const toggleEffectiveDate = (kpiName: string) => {
    setShowEffectiveDate(prev => ({
      ...prev,
      [kpiName]: !prev[kpiName]
    }));
  };

  // Aktuelle Kalenderwoche/Jahr
  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    return { week: weekNumber, year: now.getFullYear() };
  };
  const { week: currentWeek, year: currentYear } = getCurrentWeek();

  // Formular-Submit
  const handleSubmit = (formData: FormValues) => {
    const processedTargets = formData.targets.map(target => {
      const processedTarget: ProcessedTarget = {
        name: target.name,
        value: target.value,
        unit: target.unit || ""
      };
      if (showEffectiveDate[target.name]) {
        if (target.effectiveFromWeek && target.effectiveFromYear) {
          processedTarget.effectiveFromWeek = target.effectiveFromWeek;
          processedTarget.effectiveFromYear = target.effectiveFromYear;
        }
      }
      return processedTarget;
    });
    onSubmit({ targets: processedTargets });
  };

  // Hilfsfunktion: Index eines KPI-Namens in der Targets-Form-Liste
  const findTargetIndex = (kpiName: string) => form.getValues().targets.findIndex(t => t.name === kpiName);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Accordion type="multiple" className="w-full" defaultValue={KPI_CATEGORIES.map(c => c.label)}>
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
                      showEffectiveDate={showEffectiveDate[kpi.name] || false}
                      currentWeek={currentWeek}
                      currentYear={currentYear}
                      onToggleEffectiveDate={toggleEffectiveDate}
                    />
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button type="submit" className="mt-4 w-full">Zielwerte speichern</Button>
      </form>
    </Form>
  );
};

export default ScorecardTargetForm;
