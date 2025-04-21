
import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

const STORAGE_KEY = "finance_settings";

type FinanceFormValues = {
  amzRate: string;
  driverWage: string;
  expenses: string;
  hasExpenses: "yes" | "no";
};

const defaultValues: FinanceFormValues = {
  amzRate: "",
  driverWage: "",
  expenses: "",
  hasExpenses: "no",
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
            hasExpenses: parsed.hasExpenses === "yes" || parsed.hasExpenses === "no" ? parsed.hasExpenses : "no",
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

  // Watch hasExpenses to control disabled state
  const hasExpenses = form.watch("hasExpenses");

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Finanzeinstellungen</CardTitle>
        <CardDescription>
          Tragen Sie hier den AMZ-Stundensatz, den Stundenlohn für Fahrer und Spesen ein.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amzRate"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="min-w-[180px] font-medium">AMZ Stundensatz</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="z.B. 25.50" 
                      className="max-w-[200px]"
                      {...field} 
                    />
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
                  <FormLabel className="min-w-[180px] font-medium">Stundenlohn Fahrer</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="z.B. 15.00" 
                      className="max-w-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expenses"
              render={({ field: expenseField }) => (
                <FormField
                  control={form.control}
                  name="hasExpenses"
                  render={({ field: hasExpensesField }) => (
                    <FormItem className="flex items-center space-x-4">
                      <FormLabel className="min-w-[180px] font-medium">Spesen</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="z.B. 5.00"
                          className="max-w-[200px]"
                          {...expenseField}
                          disabled={hasExpenses !== "yes"}
                        />
                      </FormControl>
                      <RadioGroup
                        value={hasExpensesField.value}
                        onValueChange={hasExpensesField.onChange}
                        className="flex items-center space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="expenses-yes" />
                          <FormLabel htmlFor="expenses-yes" className="cursor-pointer">Ja</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="expenses-no" />
                          <FormLabel htmlFor="expenses-no" className="cursor-pointer">Nein</FormLabel>
                        </div>
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            />
            <div className="pt-4">
              <Button type="submit" className="w-[200px]">Speichern</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FinanceSettings;
