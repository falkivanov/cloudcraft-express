
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RepairEntry } from "@/types/vehicle";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface RepairListProps {
  repairs: RepairEntry[];
}

const RepairList = ({ repairs }: RepairListProps) => {
  const formatDateString = (dateString: string | null): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch (error) {
      console.error("Invalid date format", error);
      return dateString;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {!repairs.length ? (
          <div className="text-center py-6 text-muted-foreground">
            Keine Reparaturen gefunden
          </div>
        ) : (
          <div className="space-y-6">
            {repairs.map((repair) => (
              <Card key={repair.id} className="bg-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{formatDateString(repair.date)}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {repair.duration} {repair.duration === 1 ? 'Tag' : 'Tage'} Ausfallzeit
                      {repair.location && ` • ${repair.location}`}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">{repair.description}</p>
                  {repair.startDate && repair.endDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Zeitraum: {formatDateString(repair.startDate)} - {formatDateString(repair.endDate)}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <div className="text-sm">
                    <span className="font-medium">Gesamtkosten:</span> {repair.totalCost.toFixed(2)} €
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Unternehmen bezahlt:</span> {repair.companyPaidAmount.toFixed(2)} €
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RepairList;
