
import React, { useEffect, useState } from "react";
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
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDate } from "@/utils/dateUtils";
import { Trash } from "lucide-react";

const STORAGE_KEY = "finance_settings";
const FINANCE_HISTORY_KEY = "finance_settings_history";

export type FinanceSettings = {
  amzRate: string;
  driverWage: string;
  expenses: string;
  hasExpenses: "yes" | "no";
  validFrom?: string; // ISO date string
  createdAt: string; // ISO date string
};

const defaultValues: Omit<FinanceSettings, "createdAt"> = {
  amzRate: "",
  driverWage: "",
  expenses: "",
  hasExpenses: "no",
  validFrom: format(new Date(), "yyyy-MM-dd"),
};

const FinanceSettings: React.FC = () => {
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<FinanceSettings[]>([]);
  const [currentSettings, setCurrentSettings] = useState<FinanceSettings | null>(null);
  const [openedItem, setOpenedItem] = useState<string | null>(null);

  const form = useForm<Omit<FinanceSettings, "createdAt">>({
    defaultValues,
  });

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === "object") {
          setCurrentSettings(parsed);
          form.reset({
            amzRate: parsed.amzRate || "",
            driverWage: parsed.driverWage || "",
            expenses: parsed.expenses || "",
            hasExpenses: parsed.hasExpenses === "yes" || parsed.hasExpenses === "no" ? parsed.hasExpenses : "no",
            validFrom: parsed.validFrom || format(new Date(), "yyyy-MM-dd"),
          });
        }
      } catch (e) {
        console.error("Failed to parse finance settings:", e);
      }
    }

    loadHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = () => {
    const historyData = localStorage.getItem(FINANCE_HISTORY_KEY);
    if (historyData) {
      try {
        const parsedHistory = JSON.parse(historyData);
        if (Array.isArray(parsedHistory)) {
          const sortedHistory = parsedHistory.sort((a, b) => {
            return new Date(b.validFrom || 0).getTime() - new Date(a.validFrom || 0).getTime();
          });
          setHistoryItems(sortedHistory);
        }
      } catch (e) {
        console.error("Failed to parse finance history:", e);
      }
    }
  };

  const onSubmit = (values: Omit<FinanceSettings, "createdAt">) => {
    const newSettings: FinanceSettings = {
      ...values,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    setCurrentSettings(newSettings);

    let history: FinanceSettings[] = [];
    try {
      const historyData = localStorage.getItem(FINANCE_HISTORY_KEY);
      if (historyData) {
        history = JSON.parse(historyData);
      }
    } catch (e) {
      console.error("Failed to parse history:", e);
    }

    history.push(newSettings);
    localStorage.setItem(FINANCE_HISTORY_KEY, JSON.stringify(history));

    loadHistory();

    toast({ title: "Finanzeinstellungen gespeichert", description: "Die Werte wurden gespeichert." });
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, createdAt: string) => {
    // Stop the event from propagating to the accordion trigger
    e.stopPropagation();
    e.preventDefault();
    
    const updatedHistory = historyItems.filter((item) => item.createdAt !== createdAt);
    setHistoryItems(updatedHistory);
    localStorage.setItem(FINANCE_HISTORY_KEY, JSON.stringify(updatedHistory));
    setOpenedItem(null); // Close the accordion after deletion
    toast({ title: "Eintrag gelöscht", description: "Finanzeinstellungs-Eintrag wurde entfernt." });
  };

  const hasExpenses = form.watch("hasExpenses");

  const handleAccordionChange = (value: string) => {
    if (openedItem === value) {
      setOpenedItem(null);
    } else {
      setOpenedItem(value);
    }
  };

  return (
    <Card className="shadow">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Finanzeinstellungen</CardTitle>
        <CardDescription className="text-base">
          Tragen Sie hier den AMZ-Stundensatz, den Stundenlohn für Fahrer und Spesen ein.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="flex-1 min-w-[180px] font-medium">Gültig ab</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[200px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "dd.MM.yyyy", { locale: de })
                          ) : (
                            "Datum auswählen"
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amzRate"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="flex-1 min-w-[180px] font-medium">AMZ Stundensatz</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="z.B. 25.50" 
                      className="w-[200px]"
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
                  <FormLabel className="flex-1 min-w-[180px] font-medium">Stundenlohn Fahrer</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="z.B. 15.00" 
                      className="w-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center space-x-4">
              <FormLabel className="flex-1 min-w-[180px] font-medium">Spesen</FormLabel>
              
              <FormField
                control={form.control}
                name="expenses"
                render={({ field }) => (
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="z.B. 5.00"
                      className="w-[200px]"
                      {...field}
                      disabled={hasExpenses !== "yes"}
                    />
                  </FormControl>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasExpenses"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="yes" id="expenses-yes" />
                      <FormLabel htmlFor="expenses-yes" className="cursor-pointer">Ja</FormLabel>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="no" id="expenses-no" />
                      <FormLabel htmlFor="expenses-no" className="cursor-pointer">Nein</FormLabel>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* Erstellt am nur anzeigen, wenn das Accordion-Item geöffnet ist */}
            {openedItem && openedItem === `item-${historyItems.findIndex(h => h.createdAt === currentSettings?.createdAt)}` && currentSettings && (
              <div className="text-sm pt-2 pl-[calc(180px+1rem)] text-gray-500 space-x-1">
                <span>Erstellt am</span>
                <span>{formatDate(currentSettings.createdAt)}</span>
              </div>
            )}

            <div className="pt-4 flex space-x-4">
              <Button type="submit" className="px-8">Speichern</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? "Verlauf ausblenden" : "Verlauf anzeigen"}
              </Button>
            </div>
          </form>
        </Form>

        {showHistory && historyItems.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-6">Verlauf der Finanzeinstellungen</h3>
            <Accordion 
              type="single" 
              collapsible 
              className="w-full border border-gray-200 rounded-md"
              value={openedItem || undefined}
              onValueChange={handleAccordionChange}
            >
              {historyItems.map((item, index) => {
                const isOpen = openedItem === `item-${index}`;

                return (
                  <AccordionItem 
                    value={`item-${index}`} 
                    key={index} 
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center justify-between w-full pr-2">
                      <AccordionTrigger className="flex-1 px-4 py-3 rounded flex justify-between items-center hover:bg-gray-50">
                        <div className="flex items-center space-x-2 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">
                            Gültig ab {item.validFrom ? formatDate(item.validFrom) : "—"}
                          </span>
                        </div>
                      </AccordionTrigger>
                      {isOpen && (
                        <button
                          type="button"
                          aria-label="Eintrag löschen"
                          className="ml-3 p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                          title="Eintrag löschen"
                          onClick={(e) => handleDeleteHistoryItem(e, item.createdAt)}
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <AccordionContent className="px-6 pb-4">
                      <div className="grid gap-3 text-sm">
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="font-medium text-gray-800">AMZ Stundensatz</span>
                          <span className="text-gray-700">{item.amzRate} €</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="font-medium text-gray-800">Stundenlohn Fahrer</span>
                          <span className="text-gray-700">{item.driverWage} €</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="font-medium text-gray-800">Spesen</span>
                          <span className="text-gray-700">
                            {item.hasExpenses === "yes" ? `${item.expenses} €` : "Keine"}
                          </span>
                        </div>
                        {/* Erstelltdatum nur anzeigen, wenn Accordion-Item geöffnet */}
                        {isOpen && (
                          <div className="mt-1 text-sm text-gray-500 flex space-x-1 justify-end">
                            <span>Erstellt am</span>
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinanceSettings;
