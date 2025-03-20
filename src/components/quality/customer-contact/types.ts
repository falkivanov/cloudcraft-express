
export interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

export interface CustomerContactContentProps {
  customerContactData: string | null;
  driversData: DriverComplianceData[];
}
