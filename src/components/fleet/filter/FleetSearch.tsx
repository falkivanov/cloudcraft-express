
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FleetSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FleetSearch: React.FC<FleetSearchProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Suche nach Fahrzeugen..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-10"
      />
    </div>
  );
};

export default FleetSearch;
