
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DashboardNavigationCardProps {
  icon: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
  title: string;
  description: string;
  buttonIcon: React.ReactNode;
  buttonText: string;
  linkTo: string;
  buttonVariant?: "default" | "outline";
}

const DashboardNavigationCard: React.FC<DashboardNavigationCardProps> = ({
  icon,
  iconBgClass,
  iconTextClass,
  title,
  description,
  buttonIcon,
  buttonText,
  linkTo,
  buttonVariant = "default"
}) => {
  return (
    <Link to={linkTo} className="block">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 ${iconBgClass} rounded-full`}>
            {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${iconTextClass}` })}
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        <Button variant={buttonVariant}>
          {buttonIcon}
          {buttonText}
        </Button>
      </div>
    </Link>
  );
};

export default DashboardNavigationCard;
