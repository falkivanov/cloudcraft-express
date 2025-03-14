
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, TruckIcon, CalendarIcon, BarChart2Icon, DollarSignIcon } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Management Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Mitarbeiter</CardTitle>
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">Aktive Mitarbeiter</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Fuhrpark</CardTitle>
            <TruckIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Aktive Fahrzeuge</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Schichtplanung</CardTitle>
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">Mögliche Routen diese Woche</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Scorecard</CardTitle>
            <BarChart2Icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">Durchschnittliche KPI-Bewertung</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Finanzen</CardTitle>
            <DollarSignIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€12,450</div>
            <p className="text-xs text-muted-foreground">Umsatz diese Woche</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
