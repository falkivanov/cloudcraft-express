
import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "finance_settings";

type FinanceFormValues = {
  amzRate: string;
  driverWage: string;
  expenses: string;
};

const defaultValues: FinanceFormValues = {
  amzRate: "",
  driverWage: "",
  expenses: "",
};

const FinanceSettings: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<FinanceFormValues>({
    defaultValues,
  });

  // Load values from localStorage on mount
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === "object") {
          form.reset({
            amzRate: parsed.amzRate || "",
            driverWage: parsed.driverWage || "",
            expenses: parsed.expenses || "",
          });
        }
      } catch {}
    }
    // eslint-disable-next-line
  }, []);

  const onSubmit = (values: FinanceFormValues) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    toast({ title: "Finanzeinstellungen gespeichert", description: "Die Werte wurden gespeichert." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finanzeinstellungen</CardTitle>
        <CardDescription>
          Tragen Sie hier den AMZ-Stundensatz, den Stundenlohn für Fahrer und Spesen ein.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="amzRate"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="flex-1 min-w-[140px]">AMZ Stundensatz</FormLabel>
                  <FormControl className="flex-1">
                    <Input type="number" step="0.01" min="0" placeholder="z.B. 25.50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="driverWage"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="flex-1 min-w-[140px]">Stundenlohn Fahrer</FormLabel>
                  <FormControl className="flex-1">
                    <Input type="number" step="0.01" min="0" placeholder="z.B. 15.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expenses"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="flex-1 min-w-[140px]">Spesen</FormLabel>
                  <FormControl className="flex-1">
                    <Input type="number" step="0.01" min="0" placeholder="z.B. 5.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-2">Speichern</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FinanceSettings;

