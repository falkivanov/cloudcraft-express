import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileUpIcon } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/file-upload" className="block">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileUpIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Dateien hochladen</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Laden Sie PDF, Excel, CSV und HTML-Dateien zur Verarbeitung hoch.
            </p>
            <Button>
              <FileUpIcon className="mr-2 h-4 w-4" />
              Zu Datei-Upload
            </Button>
          </div>
        </Link>
        
        {/* Placeholder für weitere Dashboard-Elemente */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Übersicht</h2>
          <p className="text-gray-600">
            Aktuelle Statistiken und Informationen werden hier angezeigt.
          </p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Aufgaben</h2>
          <p className="text-gray-600">
            Anstehende Aufgaben und Erinnerungen werden hier angezeigt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
