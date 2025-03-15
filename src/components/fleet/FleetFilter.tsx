
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Upload } from "lucide-react";

interface FleetFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FleetFilter = ({ searchQuery, onSearchChange }: FleetFilterProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mb-6 items-center">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Fahrzeugen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="outline" className="flex items-center whitespace-nowrap">
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>
      <Button variant="outline" className="flex items-center whitespace-nowrap">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );
};

export default FleetFilter;
