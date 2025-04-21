
import React from "react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@/components/ui/table";
import { History } from "lucide-react";

const STORAGE_KEY = "scorecard_custom_targets";

type TargetItem = {
  name: string;
  value: number;
  unit: string;
};
type ScorecardTargetsWithDate = {
  targets: TargetItem[];
  validFrom?: string;
};

// Utility zum Laden der History (einfach alles gesammelte aus LocalStorage, Format: Array oder Objekt)
function getHistory(): ScorecardTargetsWithDate[] {
  // Für MVP: Nur das aktuelle Item anzeigen (kann beliebig zu einer echten Historie erweitert werden je nach Backup-Strategie)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // Prüfe ob ein Array (Legacy Support) oder ein Objekt (modern)
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return [{ targets: parsed }];
    }
    // Neu: ein Objekt mit {validFrom, targets}
    return [{ validFrom: parsed.validFrom, targets: parsed.targets }];
  } catch {
    return [];
  }
}

const ScorecardTargetHistorySheet: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const history = getHistory();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center mt-2 w-full">
          <History className="w-4 h-4" />
          Zielwerte Historie anzeigen
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="min-w-[340px] max-w-md">
        <SheetHeader>
          <SheetTitle>Scorecard Zielwerte Historie</SheetTitle>
          <span className="text-xs text-muted-foreground block">Alle gespeicherten Zielwerte im Überblick</span>
        </SheetHeader>
        <div className="mt-5 max-h-[80vh] overflow-y-auto pr-2">
          {history.length === 0 && <div className="text-sm text-muted-foreground">Keine Historie gefunden.</div>}
          {history.map((entry, idx) => (
            <div key={idx} className="mb-8">
              <div className="font-medium text-sm mb-2">
                {entry.validFrom
                  ? <>Gültig ab: <span className="text-muted-foreground">{entry.validFrom}</span></>
                  : <>Kein gültig ab Datum gespeichert</>}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead>Zielwert</TableHead>
                      <TableHead>Einheit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entry.targets.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>{t.value}</TableCell>
                        <TableCell>{t.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ScorecardTargetHistorySheet;

