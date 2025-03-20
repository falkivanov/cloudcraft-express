
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerContactOverview from "./CustomerContactOverview";
import DriversTable from "./DriversTable";
import ReportDisplay from "./ReportDisplay";
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
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="drivers">Fahrerdaten</TabsTrigger>
          <TabsTrigger value="report">Vollständiger Bericht</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <CustomerContactOverview driversData={driversData} />
        </TabsContent>
        
        <TabsContent value="drivers">
          <DriversTable driversData={driversData} />
        </TabsContent>
        
        <TabsContent value="report">
          <ReportDisplay reportData={customerContactData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerContactContent;
