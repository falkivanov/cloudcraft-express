
import React from "react";

interface QualityPageHeaderProps {
  pathname: string;
}

const QualityPageHeader: React.FC<QualityPageHeaderProps> = ({ pathname }) => {
  const getPageTitle = () => {
    if (pathname.includes("/quality/scorecard")) {
      return "Scorecard";
    } else if (pathname.includes("/quality/customer-contact")) {
      return "Customer Contact";
    } else if (pathname.includes("/quality/concessions")) {
      return "Concessions";
    } else if (pathname.includes("/quality/mentor")) {
      return "Mentor";
    }
    return "Qualitätsmanagement";
  };

  return <h1 className="text-3xl font-bold mb-6">{getPageTitle()}</h1>;
};

export default QualityPageHeader;
