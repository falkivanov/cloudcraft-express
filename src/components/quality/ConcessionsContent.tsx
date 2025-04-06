
import React, { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileSpreadsheet, 
  CalendarIcon, 
  UploadIcon, 
  ArrowUpDown,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConcessionsContentProps } from "./concessions/types";
import { formatCurrency } from "./concessions/utils";
import { Badge } from "@/components/ui/badge";

const ConcessionsContent: React.FC<ConcessionsContentProps> = ({ concessionsData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({ key: '', direction: 'ascending' });

  if (!concessionsData || !concessionsData.fileName) {
    return <NoDataMessage category="concessions" />;
  }

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter items based on search term
  const filteredItems = concessionsData.items.filter(item => 
    item.transportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortConfig.key === '') return 0;
    
    let valueA: any = a[sortConfig.key as keyof typeof a];
    let valueB: any = b[sortConfig.key as keyof typeof b];
    
    // Format dates for comparison
    if (sortConfig.key === 'deliveryDateTime') {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }
    
    if (valueA < valueB) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-orange-500" /> 
          Concessions Daten
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link to="/file-upload" className="flex items-center gap-2">
            <UploadIcon className="h-4 w-4" />
            <span>Neue Datei hochladen</span>
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg">
                Concessions für Woche {concessionsData.currentWeek}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Dateiname: {concessionsData.fileName}</span>
              </div>
            </div>
            
            <Badge variant="outline" className="bg-orange-100 border-orange-200 text-orange-800 px-3 py-1">
              Gesamt: {formatCurrency(concessionsData.totalCost)}
            </Badge>
          </div>
          
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen nach Transport ID, Tracking ID oder Grund..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('transportId')}>
                    <div className="flex items-center gap-1">
                      Transport ID
                      {sortConfig.key === 'transportId' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('trackingId')}>
                    <div className="flex items-center gap-1">
                      Tracking ID
                      {sortConfig.key === 'trackingId' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('deliveryDateTime')}>
                    <div className="flex items-center gap-1">
                      Lieferdatum
                      {sortConfig.key === 'deliveryDateTime' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('reason')}>
                    <div className="flex items-center gap-1">
                      Grund
                      {sortConfig.key === 'reason' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => requestSort('cost')}>
                    <div className="flex items-center justify-end gap-1">
                      Kosten
                      {sortConfig.key === 'cost' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Keine Ergebnisse gefunden' : 'Keine Daten vorhanden'}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedItems.map((item, index) => (
                    <TableRow key={`${item.transportId}-${item.trackingId}-${index}`}>
                      <TableCell className="font-medium">{item.transportId}</TableCell>
                      <TableCell>{item.trackingId}</TableCell>
                      <TableCell>
                        {new Date(item.deliveryDateTime).toLocaleString('de-DE', { 
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.cost)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConcessionsContent;
