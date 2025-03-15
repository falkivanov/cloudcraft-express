
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RepairCostSectionProps {
  totalCost: number;
  companyPaidAmount: number;
  onTotalCostChange: (value: number) => void;
  onCompanyPaidChange: (value: number) => void;
}

const RepairCostSection = ({
  totalCost,
  companyPaidAmount,
  onTotalCostChange,
  onCompanyPaidChange
}: RepairCostSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="repair-total-cost">Gesamtkosten (€)</Label>
        <Input 
          id="repair-total-cost" 
          type="number" 
          min="0"
          step="0.01"
          value={totalCost}
          onChange={(e) => onTotalCostChange(parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="repair-company-paid">Unternehmen bezahlt (€)</Label>
        <Input 
          id="repair-company-paid" 
          type="number" 
          min="0"
          step="0.01"
          value={companyPaidAmount}
          onChange={(e) => onCompanyPaidChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
};

export default RepairCostSection;
