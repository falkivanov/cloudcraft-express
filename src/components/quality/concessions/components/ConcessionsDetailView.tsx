
import React, { useMemo, useState } from "react";
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from "@/components/ui/table";
import { ConcessionItem } from "../types";
import { formatCurrency } from "../utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ConcessionsDetailViewProps {
  items: ConcessionItem[];
}

type SortConfig = {
  key: 'deliveryDateTime' | 'cost';
  direction: 'asc' | 'desc';
} | null;

const ConcessionsDetailView: React.FC<ConcessionsDetailViewProps> = ({ items }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'deliveryDateTime',
    direction: 'asc'
  });
  
  // Request sort when a column header is clicked
  const requestSort = (key: 'deliveryDateTime' | 'cost') => {
    setSortConfig(currentConfig => {
      if (currentConfig?.key === key) {
        return { 
          key, 
          direction: currentConfig.direction === 'asc' ? 'desc' : 'asc' 
        };
      }
      return { key, direction: 'asc' };
    });
  };
  
  // Get the sort indicator icon based on current sort configuration
  const getSortIcon = (columnKey: 'deliveryDateTime' | 'cost') => {
    if (sortConfig?.key !== columnKey) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3 inline ml-1" /> 
      : <ChevronDown className="h-3 w-3 inline ml-1" />;
  };
  
  // Sort the items based on the sort configuration
  const sortedItems = useMemo(() => {
    const itemsCopy = [...items];
    
    if (!sortConfig) return itemsCopy;
    
    return itemsCopy.sort((a, b) => {
      if (sortConfig.key === 'deliveryDateTime') {
        const dateA = new Date(a.deliveryDateTime).getTime();
        const dateB = new Date(b.deliveryDateTime).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sortConfig.key === 'cost') {
        return sortConfig.direction === 'asc' ? a.cost - b.cost : b.cost - a.cost;
      }
      
      return 0;
    });
  }, [items, sortConfig]);
  
  return (
    <TableRow>
      <TableCell colSpan={5} className="p-0 border-0">
        <div className="bg-muted/30 p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Tracking ID</TableHead>
                <TableHead 
                  className="text-xs cursor-pointer hover:bg-muted/70"
                  onClick={() => requestSort('deliveryDateTime')}
                >
                  Lieferdatum {getSortIcon('deliveryDateTime')}
                </TableHead>
                <TableHead className="text-xs">Grund</TableHead>
                <TableHead 
                  className="text-xs text-right cursor-pointer hover:bg-muted/70"
                  onClick={() => requestSort('cost')}
                >
                  Kosten {getSortIcon('cost')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item, index) => (
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
  );
};

export default ConcessionsDetailView;
