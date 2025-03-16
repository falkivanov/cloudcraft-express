
import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MessageSquare, Copy } from "lucide-react";
import { parseCustomerContactReport, generateDriverMessage } from "@/utils/customerContactUtils";
import { toast } from "sonner";

interface CustomerContactTableProps {
  htmlContent: string;
}

const CustomerContactTable: React.FC<CustomerContactTableProps> = ({ htmlContent }) => {
  const reportData = parseCustomerContactReport(htmlContent);
  
  const copyMessageToClipboard = (message: string, driverName: string) => {
    navigator.clipboard.writeText(message)
      .then(() => {
        toast.success(`Nachricht für ${driverName} in die Zwischenablage kopiert`);
      })
      .catch(() => {
        toast.error("Fehler beim Kopieren der Nachricht");
      });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Wöchentlicher Kundenkontakt-Bericht</h2>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Fahrer</TableHead>
              <TableHead>Ges. Adressen</TableHead>
              <TableHead>Kontaktiert</TableHead>
              <TableHead>Prozent</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.length > 0 ? (
              reportData.map((row, index) => {
                const message = generateDriverMessage(row);
                const isPercentageLow = row.percentage < 98;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.driverName}</TableCell>
                    <TableCell>{row.totalAddresses}</TableCell>
                    <TableCell>{row.totalContacts}</TableCell>
                    <TableCell>
                      <span 
                        className={`font-medium px-2 py-1 rounded-md ${
                          isPercentageLow 
                            ? "bg-red-100 text-red-800" 
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {row.percentage.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {isPercentageLow && message && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyMessageToClipboard(message, row.driverName)}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="hidden sm:inline">Nachricht</span>
                          <Copy className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Keine Daten verfügbar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {reportData.filter(row => row.percentage < 98).length > 0 && (
        <div className="bg-muted p-4 rounded-md space-y-4">
          <h3 className="font-medium">Nachrichten für Fahrer mit Kontaktquote unter 98%</h3>
          <div className="space-y-3">
            {reportData
              .filter(row => row.percentage < 98)
              .map((row, index) => {
                const message = generateDriverMessage(row);
                return (
                  <div key={index} className="bg-background p-3 rounded-md border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{row.driverName}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyMessageToClipboard(message, row.driverName)}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        <span className="text-xs">Kopieren</span>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{message}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerContactTable;
