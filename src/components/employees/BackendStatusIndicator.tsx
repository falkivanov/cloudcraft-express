
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, WifiOff, RefreshCw } from "lucide-react";
import { api } from '@/services/api';

const BackendStatusIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      // Use the health check endpoint if available
      const isHealthy = await api.checkHealth();
      setIsConnected(isHealthy);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Check connection on mount
  useEffect(() => {
    checkConnection();
    
    // Recheck every minute
    const interval = setInterval(checkConnection, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return (
      <Badge variant="outline" className="bg-gray-100">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Verbindungsprüfung...
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className="cursor-pointer"
            onClick={checkConnection}
          >
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Backend verbunden
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Keine Backend-Verbindung
              </>
            )}
            {isChecking && <RefreshCw className="h-3 w-3 ml-1 animate-spin" />}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isConnected 
            ? "Die Verbindung zum Backend-Server ist aktiv." 
            : "Keine Verbindung zum Backend-Server möglich. Bitte stellen Sie sicher, dass der Server läuft."}
          <div className="text-xs mt-1">Klicken zum Aktualisieren</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BackendStatusIndicator;
