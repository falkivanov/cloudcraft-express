
import React from "react";
import { Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaveGroup } from "../utils/wave-utils";

interface WaveEmployeeDisplayProps {
  sortedWaves: WaveGroup[];
  isSingleWave: boolean;
  cardTitle?: string;
}

const WaveEmployeeDisplay: React.FC<WaveEmployeeDisplayProps> = ({
  sortedWaves,
  isSingleWave,
  cardTitle
}) => {
  return (
    <Card className="overflow-hidden mt-6">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-lg">
          {cardTitle || (isSingleWave 
            ? `Alle Mitarbeiter: Start um ${sortedWaves[0]?.startTime} Uhr` 
            : `Eingeplante Mitarbeiter nach Startwellen`)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isSingleWave ? (
          <ul className="space-y-2">
            {sortedWaves[0]?.employees.map((employee) => (
              <li key={employee.id} className="py-2 border-b last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">{employee.name}</span>
                    {employee.telegramUsername && (
                      <div className="text-sm text-blue-500">
                        @{employee.telegramUsername}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {employee.phone}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-4">
            {sortedWaves.map((wave, index) => (
              <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Welle {wave.waveNumber}: Start um {wave.startTime} Uhr</h3>
                  <div className="ml-auto bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{wave.employees.length} Mitarbeiter</span>
                  </div>
                </div>
                <ul className="space-y-1 pl-6">
                  {wave.employees.map((employee) => (
                    <li key={employee.id} className="py-1">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{employee.name}</span>
                          {employee.telegramUsername && (
                            <div className="text-sm text-blue-500">
                              @{employee.telegramUsername}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {employee.phone}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaveEmployeeDisplay;
