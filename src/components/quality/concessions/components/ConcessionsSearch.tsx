
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ConcessionsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ConcessionsSearch: React.FC<ConcessionsSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="relative mt-2">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Suchen nach Fahrer, Transport ID, Tracking ID oder Grund..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default ConcessionsSearch;
