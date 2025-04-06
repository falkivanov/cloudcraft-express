
import React, { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileSpreadsheet, 
  CalendarIcon, 
  UploadIcon, 
  ArrowUpDown,
  Search,
  ChevronDown,
  ChevronRight
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
import { useConcessionsData } from "./hooks/quality-data/useConcessionsData";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ConcessionsContent: React.FC<ConcessionsContentProps> = ({ concessionsData: propConcessionsData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({ key: '', direction: 'ascending' });

  const {
    groupedConcessions,
    expandedTransportId,
    toggleExpandTransportId
  } = useConcessionsData();

  if (!propConcessionsData || !propConcessionsData.fileName) {
    return <NoDataMessage category="concessions" />;
  }

  // Filter grouped items based on search term
  const filteredGroups = groupedConcessions.filter(group => 
    group.transportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.items.some(item => 
      item.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Apply sorting to groups
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortConfig.key === '') return 0;
    
    let valueA: any = a[sortConfig.key as keyof typeof a];
    let valueB: any = b[sortConfig.key as keyof typeof b];
    
    if (valueA < valueB) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

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
                Concessions für Woche {propConcessionsData.currentWeek}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Dateiname: {propConcessionsData.fileName}</span>
              </div>
            </div>
            
            <Badge variant="outline" className="bg-orange-100 border-orange-200 text-orange-800 px-3 py-1">
              Gesamt: {formatCurrency(propConcessionsData.totalCost)}
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
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('transportId')}>
                    <div className="flex items-center gap-1">
                      Transport ID
                      {sortConfig.key === 'transportId' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('count')}>
                    <div className="flex items-center gap-1">
                      Anzahl
                      {sortConfig.key === 'count' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => requestSort('totalCost')}>
                    <div className="flex items-center justify-end gap-1">
                      Kosten
                      {sortConfig.key === 'totalCost' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Keine Ergebnisse gefunden' : 'Keine Daten vorhanden'}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedGroups.map((group) => (
                    <React.Fragment key={group.transportId}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/80"
                        onClick={() => toggleExpandTransportId(group.transportId)}
                      >
                        <TableCell className="p-2">
                          {expandedTransportId === group.transportId ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{group.transportId}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{group.count}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(group.totalCost)}
                        </TableCell>
                      </TableRow>

                      {expandedTransportId === group.transportId && (
                        <TableRow>
                          <TableCell colSpan={4} className="p-0 border-0">
                            <div className="bg-muted/30 p-2">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">Tracking ID</TableHead>
                                    <TableHead className="text-xs">Lieferdatum</TableHead>
                                    <TableHead className="text-xs">Grund</TableHead>
                                    <TableHead className="text-xs text-right">Kosten</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.items.map((item, index) => (
                                    <TableRow key={`${item.trackingId}-${index}`} className="border-0 hover:bg-muted/50">
                                      <TableCell className="text-xs py-2">{item.trackingId}</TableCell>
                                      <TableCell className="text-xs py-2">
                                        {new Date(item.deliveryDateTime).toLocaleString('de-DE', { 
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </TableCell>
                                      <TableCell className="text-xs py-2">{item.reason}</TableCell>
                                      <TableCell className="text-xs py-2 text-right">
                                        {formatCurrency(item.cost)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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
