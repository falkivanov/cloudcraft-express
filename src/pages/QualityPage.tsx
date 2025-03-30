
import React from "react";
import { useLocation } from "react-router-dom";
import { Container } from "@/components/ui/container";
import QualityTabs from "@/components/quality/QualityTabs";
import QualityPageHeader from "@/components/quality/QualityPageHeader";
import QualityPageContent from "@/components/quality/QualityPageContent";
import { useQualityData } from "@/components/quality/hooks/useQualityData";

const QualityPage = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const {
    customerContactData,
    scorecardData,
    prevWeekScoreCardData,
    concessionsData,
    mentorData,
    driversData,
    dataLoaded
  } = useQualityData(pathname);

  return (
    <Container className="p-4 md:p-8">
      <QualityPageHeader pathname={pathname} />
      <QualityTabs />
      <div className="mt-6">
        <QualityPageContent
          pathname={pathname}
          dataLoaded={dataLoaded}
          scorecardData={scorecardData}
          prevWeekScoreCardData={prevWeekScoreCardData}
          customerContactData={customerContactData}
          driversData={driversData}
          concessionsData={concessionsData}
          mentorData={mentorData}
        />
      </div>
    </Container>
  );
};

export default QualityPage;
