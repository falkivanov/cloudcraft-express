import React from "react";
import { 
  UserIcon, 
  TruckIcon, 
  CalendarIcon, 
  BarChart2Icon, 
  DollarSignIcon, 
  HomeIcon,
  SettingsIcon,
  FileUpIcon,
  CheckIcon,
  PhoneCallIcon,
  ClipboardIcon,
  TicketIcon,
  AwardIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", path: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { name: "Mitarbeiter", path: "/employees", icon: <UserIcon className="h-5 w-5" /> },
  { name: "Fuhrpark", path: "/fleet", icon: <TruckIcon className="h-5 w-5" /> },
  { name: "Schichtplanung", path: "/shifts", icon: <CalendarIcon className="h-5 w-5" /> },
  { name: "Qualität", path: "/quality", icon: <BarChart2Icon className="h-5 w-5" /> },
  { name: "Finanzen", path: "/finance", icon: <DollarSignIcon className="h-5 w-5" /> },
];

// Unterpunkte für die Qualitätsseite
export const qualitySubItems: NavItem[] = [
  { name: "Scorecard", path: "/quality/scorecard", icon: <CheckIcon className="h-5 w-5" /> },
  { name: "Customer Contact", path: "/quality/customer-contact", icon: <PhoneCallIcon className="h-5 w-5" /> },
  { name: "POD", path: "/quality/pod", icon: <ClipboardIcon className="h-5 w-5" /> },
  { name: "Concessions", path: "/quality/concessions", icon: <TicketIcon className="h-5 w-5" /> },
  { name: "Mentor", path: "/quality/mentor", icon: <AwardIcon className="h-5 w-5" /> },
];

const fileUploadItem: NavItem = { 
  name: "Dateien hochladen", 
  path: "/file-upload", 
  icon: <FileUpIcon className="h-5 w-5" /> 
};

const settingsNavItem: NavItem = { 
  name: "Einstellungen", 
  path: "/settings", 
  icon: <SettingsIcon className="h-5 w-5" /> 
};

export const navigationItems = {
  mainNavItems,
  fileUploadItem,
  settingsNavItem,
  qualitySubItems
};
