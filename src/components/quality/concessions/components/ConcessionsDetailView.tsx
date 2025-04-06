
import React from "react";
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from "@/components/ui/table";
import { ConcessionItem } from "../types";
import { formatCurrency } from "../utils";

interface ConcessionsDetailViewProps {
  items: ConcessionItem[];
}

const ConcessionsDetailView: React.FC<ConcessionsDetailViewProps> = ({ items }) => {
  return (
    <TableRow>
      <TableCell colSpan={5} className="p-0 border-0">
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
              {items.map((item, index) => (
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
