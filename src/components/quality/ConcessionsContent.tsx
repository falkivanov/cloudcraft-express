
import React from "react";
import NoDataMessage from "./NoDataMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, CalendarIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Table, TableBody } from "@/components/ui/table";
import { ConcessionsContentProps } from "./concessions/types";
import { formatCurrency } from "./concessions/utils";
import { Badge } from "@/components/ui/badge";
import { useConcessionsData } from "./hooks/quality-data/useConcessionsData";
import ConcessionsTableHeader from "./concessions/components/ConcessionsTableHeader";
import ConcessionsTableRow from "./concessions/components/ConcessionsTableRow";
import ConcessionsDetailView from "./concessions/components/ConcessionsDetailView";
import ConcessionsSearch from "./concessions/components/ConcessionsSearch";
import ConcessionsEmptyState from "./concessions/components/ConcessionsEmptyState";
import { useConcessionsSorting } from "./concessions/hooks/useConcessionsSorting";
import ConcessionsWeekSelector from "./concessions/components/ConcessionsWeekSelector";

const ConcessionsContent: React.FC<ConcessionsContentProps> = ({ concessionsData: propConcessionsData }) => {
  const { 
    groupedConcessions,
    selectedWeek,
    setSelectedWeek,
    availableWeeks,
    totalCost,
    filteredItems, // Added this to get the count of concessions
    expandedTransportId,
    toggleExpandTransportId
  } = useConcessionsData();
  
  const { searchTerm, setSearchTerm, sortConfig, requestSort, sortedGroups } = useConcessionsSorting(groupedConcessions);

  if (!propConcessionsData || !propConcessionsData.fileName) {
    return <NoDataMessage category="concessions" />;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-orange-500" /> 
          Concessions Daten
        </h2>
      </div>

      <div className="flex items-center justify-between">
        <ConcessionsWeekSelector
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          availableWeeks={availableWeeks}
        />
        
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
                Concessions für Woche {selectedWeek || propConcessionsData.currentWeek}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Dateiname: {propConcessionsData.fileName}</span>
              </div>
            </div>
            
            <Badge variant="outline" className="bg-orange-100 border-orange-200 text-orange-800 px-3 py-1">
              Gesamt: {formatCurrency(totalCost)} ({filteredItems.length} Concessions)
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
            <ConcessionsSearch 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <ConcessionsTableHeader 
                sortConfig={sortConfig} 
                requestSort={requestSort} 
              />
              
              <TableBody>
                {sortedGroups.length === 0 ? (
                  <ConcessionsEmptyState searchTerm={searchTerm} />
                ) : (
                  sortedGroups.map((group) => (
                    <React.Fragment key={group.transportId}>
                      <ConcessionsTableRow
                        group={group}
                        isExpanded={expandedTransportId === group.transportId}
                        onToggleExpand={() => toggleExpandTransportId(group.transportId)}
                      />

                      {expandedTransportId === group.transportId && (
                        <ConcessionsDetailView items={group.items} />
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
