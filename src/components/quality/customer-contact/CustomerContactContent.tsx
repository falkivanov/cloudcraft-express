
import React, { useState, useEffect } from "react";
import CustomerContactOverview from "./CustomerContactOverview";
import DriversTable from "./DriversTable";
import NoDataMessage from "./NoDataMessage";
import CustomerContactWeekSelector from "./CustomerContactWeekSelector";
import { useCustomerContactWeek } from "./hooks/useCustomerContactWeek";
import { CustomerContactContentProps } from "./types";
import ReportDisplay from "./ReportDisplay";

const CustomerContactContent: React.FC<CustomerContactContentProps> = ({ 
  customerContactData, 
  driversData 
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const { selectedWeek, setSelectedWeek } = useCustomerContactWeek();
  
  useEffect(() => {
    console.log("CustomerContactContent rendering with data:", {
      hasHtmlData: !!customerContactData,
      driversCount: driversData?.length || 0
    });
  }, [customerContactData, driversData]);

  if (!customerContactData || !driversData || driversData.length === 0) {
    return <NoDataMessage category="Customer Contact" />;
  }
  
  const handleFilterChange = (filter: string) => {
    // Toggle the filter off if it's already active
    if (filter === activeFilter) {
      setActiveFilter("all");
    } else {
      setActiveFilter(filter);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Header and Week Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Contact</h2>
        <CustomerContactWeekSelector
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
        />
      </div>
      
      {/* Overview Cards */}
      <CustomerContactOverview 
        driversData={driversData} 
        onFilterChange={handleFilterChange} 
        activeFilter={activeFilter}
      />
      
      {/* Drivers Data Table */}
      <DriversTable 
        driversData={driversData} 
        activeFilter={activeFilter} 
      />
      
      {/* Original HTML Report (Optional) */}
      {customerContactData && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Original Report</h3>
          <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[600px] shadow-sm">
            <ReportDisplay reportData={customerContactData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerContactContent;
