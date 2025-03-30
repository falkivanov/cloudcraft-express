
import React from "react";
import { IdCard, CalendarDays, MapPin, Phone, MessageCircle } from "lucide-react";
import DetailItem from "./DetailItem";
import { Employee } from "@/types/employee";
import { formatDate } from "@/utils/dateUtils";

interface PersonalInfoSectionProps {
  employee: Employee;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ employee }) => {
  return (
    <div className="space-y-2">
      <DetailItem
        icon={IdCard}
        label="Transporter ID"
        value={employee.transporterId}
      />
      
      <DetailItem
        icon={IdCard}
        label="Status"
        value={employee.status}
      />
      
      <DetailItem
        icon={CalendarDays}
        label="Startdatum"
        value={formatDate(employee.startDate)}
      />
      
      {employee.endDate && (
        <DetailItem
          icon={CalendarDays}
          label="Enddatum"
          value={formatDate(employee.endDate)}
        />
      )}
      
      <DetailItem
        icon={MapPin}
        label="Adresse"
        value={employee.address}
      />
      
      <DetailItem
        icon={MessageCircle}
        label="Telegram"
        value={employee.telegramUsername || "-"}
      />

      <DetailItem
        icon={Phone}
        label="Telefon"
        value={employee.phone}
      />

      <DetailItem
        icon={IdCard}
        label="E-Mail"
        value={employee.email}
      />
    </div>
  );
};

export default PersonalInfoSection;
