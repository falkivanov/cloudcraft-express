
import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface DetailItemProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default DetailItem;
