
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TargetDefinition } from "@/components/quality/scorecard/utils/helpers/statusHelper";
import { FormValues, TargetItem } from "./ScorecardTargetForm";

export const KPI_CATEGORIES: { 
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

export function useScorecardTargetForm(STORAGE_KEY: string) {
  const [showEffectiveDate, setShowEffectiveDate] = useState<{[key: string]: boolean}>({});
  const [isEditing, setIsEditing] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string[]>([]);

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
  }, [form, STORAGE_KEY]);

  const toggleEffectiveDate = (kpiName: string) => {
    setShowEffectiveDate(prev => ({
      ...prev,
      [kpiName]: !prev[kpiName]
    }));
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    return { week: weekNumber, year: now.getFullYear() };
  };
  const { week: currentWeek, year: currentYear } = getCurrentWeek();

  const findTargetIndex = (kpiName: string) =>
    form.getValues().targets.findIndex(t => t.name === kpiName);

  return {
    form,
    showEffectiveDate,
    setShowEffectiveDate,
    isEditing,
    setIsEditing,
    toggleEffectiveDate,
    currentWeek,
    currentYear,
    findTargetIndex,
    KPI_CATEGORIES,
    accordionValue,
    setAccordionValue
  };
}
