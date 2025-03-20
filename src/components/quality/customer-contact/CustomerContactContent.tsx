
import React from "react";
import CustomerContactOverview from "./CustomerContactOverview";
import DriversTable from "./DriversTable";
import NoDataMessage from "./NoDataMessage";
import { CustomerContactContentProps } from "./types";

const CustomerContactContent: React.FC<CustomerContactContentProps> = ({ 
  customerContactData, 
  driversData 
}) => {
  if (!customerContactData) {
    return <NoDataMessage category="Customer Contact" />;
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Overview Cards */}
      <CustomerContactOverview driversData={driversData} />
      
      {/* Drivers Data Table */}
      <DriversTable driversData={driversData} />
    </div>
  );
};

export default CustomerContactContent;
