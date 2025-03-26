
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { qualitySubItems } from "../navbar/navigationItems";
import { Badge } from "@/components/ui/badge";

const QualityTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  const getActiveTab = () => {
    if (pathname.includes("scorecard")) return "scorecard";
    if (pathname.includes("customer-contact")) return "customer-contact";
    if (pathname.includes("concessions")) return "concessions";
    if (pathname.includes("mentor")) return "mentor";
    return "scorecard"; // Default
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    switch (value) {
      case "scorecard":
        navigate("/quality/scorecard");
        break;
      case "customer-contact":
        navigate("/quality/customer-contact");
        break;
      case "concessions":
        navigate("/quality/concessions");
        break;
      case "mentor":
        navigate("/quality/mentor");
        break;
      default:
        navigate("/quality/scorecard");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6 grid grid-cols-4 w-full">
        <TabsTrigger value="scorecard" className="flex items-center gap-2">
          {qualitySubItems[0].icon}
          <span className="hidden md:inline">{qualitySubItems[0].name}</span>
        </TabsTrigger>
        <TabsTrigger value="customer-contact" className="flex items-center gap-2">
          {qualitySubItems[1].icon}
          <span className="hidden md:inline">{qualitySubItems[1].name}</span>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs hidden md:flex">Beta</Badge>
        </TabsTrigger>
        <TabsTrigger value="concessions" className="flex items-center gap-2">
          {qualitySubItems[2].icon}
          <span className="hidden md:inline">{qualitySubItems[2].name}</span>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs hidden md:flex">Beta</Badge>
        </TabsTrigger>
        <TabsTrigger value="mentor" className="flex items-center gap-2">
          {qualitySubItems[3].icon}
          <span className="hidden md:inline">{qualitySubItems[3].name}</span>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs hidden md:flex">Beta</Badge>
        </TabsTrigger>
      </TabsList>
      
      {/* We'll hide these TabsContent elements since we're using routes to handle the content */}
      <TabsContent value="scorecard" className="hidden" />
      <TabsContent value="customer-contact" className="hidden" />
      <TabsContent value="concessions" className="hidden" />
      <TabsContent value="mentor" className="hidden" />
    </Tabs>
  );
};

export default QualityTabs;
