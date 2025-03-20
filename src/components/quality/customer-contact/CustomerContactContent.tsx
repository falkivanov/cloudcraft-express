
import React, { useState } from "react";
import CustomerContactOverview from "./CustomerContactOverview";
import DriversTable from "./DriversTable";
import NoDataMessage from "./NoDataMessage";
import { CustomerContactContentProps } from "./types";

const CustomerContactContent: React.FC<CustomerContactContentProps> = ({ 
  customerContactData, 
  driversData 
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  if (!customerContactData) {
    return <NoDataMessage category="Customer Contact" />;
  }
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Overview Cards */}
      <CustomerContactOverview 
        driversData={driversData} 
        onFilterChange={handleFilterChange} 
      />
      
      {/* Drivers Data Table */}
      <DriversTable 
        driversData={driversData} 
        activeFilter={activeFilter} 
      />
    </div>
  );
};

export default CustomerContactContent;
