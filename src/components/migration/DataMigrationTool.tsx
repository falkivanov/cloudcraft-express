
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BadgeCheck, AlertTriangle, Upload, Database, RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { STORAGE_KEYS, loadFromStorage } from '@/utils/storage';
import { Employee } from '@/types/employee';
import { ShiftAssignment } from '@/types/shift';
import { useToast } from '@/components/ui/use-toast';

const DataMigrationTool = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('employees');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    total: number;
    success: number;
    failed: number;
    skipped: number;
  }>({ total: 0, success: 0, failed: 0, skipped: 0 });
  
  // Mitarbeiterdaten aus localStorage laden und ans Backend senden
  const migrateEmployees = async () => {
    try {
      setMigrationStatus('loading');
      setProgress(10);
      
      // Daten aus localStorage laden
      const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
      
      if (!employees || employees.length === 0) {
        toast.warning('Keine Mitarbeiterdaten gefunden', {
          description: 'Es wurden keine Daten zum Migrieren gefunden.'
        });
        setMigrationStatus('idle');
        return;
      }
      
      setProgress(25);
      setResults({ total: employees.length, success: 0, failed: 0, skipped: 0 });
      
      // Daten zum Backend senden
      const response = await api.employees.createBatch(employees);
      
      setProgress(100);
      
      if (response.success && response.data) {
        setResults({
          total: employees.length,
          success: response.data.created.length,
          skipped: response.data.skipped,
          failed: 0
        });
        
        setMigrationStatus('success');
        
        toast.success('Mitarbeiterdaten migriert', {
          description: `${response.data.created.length} Mitarbeiter erfolgreich migriert.`
        });
      } else {
        setMigrationStatus('error');
        toast.error('Fehler bei der Migration', {
          description: response.error || 'Unbekannter Fehler'
        });
      }
    } catch (error) {
      console.error('Fehler bei der Migration der Mitarbeiterdaten:', error);
      setMigrationStatus('error');
      setProgress(100);
      
      toast.error('Fehler bei der Migration', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  };
  
  // Schichtdaten aus localStorage laden und ans Backend senden
  const migrateShifts = async () => {
    try {
      setMigrationStatus('loading');
      setProgress(10);
      
      // Daten aus localStorage laden
      const shiftsObject = loadFromStorage<Record<string, ShiftAssignment>>(STORAGE_KEYS.SHIFTS_MAP);
      
      if (!shiftsObject || Object.keys(shiftsObject).length === 0) {
        toast.warning('Keine Schichtdaten gefunden', {
          description: 'Es wurden keine Daten zum Migrieren gefunden.'
        });
        setMigrationStatus('idle');
        return;
      }
      
      // Konvertiere das Objekt in ein Array
      const shifts = Object.values(shiftsObject);
      
      setProgress(25);
      setResults({ total: shifts.length, success: 0, failed: 0, skipped: 0 });
      
      // Daten zum Backend senden
      const response = await api.shifts.createBatch(shifts);
      
      setProgress(100);
      
      if (response.success && response.data) {
        setResults({
          total: shifts.length,
          success: response.data.length,
          skipped: 0,
          failed: shifts.length - response.data.length
        });
        
        setMigrationStatus('success');
        
        toast.success('Schichtdaten migriert', {
          description: `${response.data.length} Schichten erfolgreich migriert.`
        });
      } else {
        setMigrationStatus('error');
        toast.error('Fehler bei der Migration', {
          description: response.error || 'Unbekannter Fehler'
        });
      }
    } catch (error) {
      console.error('Fehler bei der Migration der Schichtdaten:', error);
      setMigrationStatus('error');
      setProgress(100);
      
      toast.error('Fehler bei der Migration', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  };
  
  // Validierung der Daten vor der Migration
  const validateData = (dataType: 'employees' | 'shifts'): boolean => {
    try {
      if (dataType === 'employees') {
        const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
        
        if (!employees || employees.length === 0) {
          toast.warning('Keine Mitarbeiterdaten gefunden');
          return false;
        }
        
        // Validiere jedes Employee-Objekt
        let isValid = true;
        employees.forEach((emp, index) => {
          if (!emp.id || !emp.name || !emp.email) {
            console.warn(`Ungültiger Mitarbeiter an Position ${index}:`, emp);
            isValid = false;
          }
        });
        
        if (!isValid) {
          toast.warning('Einige Mitarbeiterdaten sind ungültig', {
            description: 'Prüfen Sie die Konsole für Details.'
          });
        }
        
        return isValid;
      } else if (dataType === 'shifts') {
        const shiftsObject = loadFromStorage<Record<string, ShiftAssignment>>(STORAGE_KEYS.SHIFTS_MAP);
        
        if (!shiftsObject || Object.keys(shiftsObject).length === 0) {
          toast.warning('Keine Schichtdaten gefunden');
          return false;
        }
        
        // Validiere jedes Shift-Objekt
        let isValid = true;
        Object.values(shiftsObject).forEach((shift, index) => {
          if (!shift.id || !shift.employeeId || !shift.date) {
            console.warn(`Ungültige Schicht an Position ${index}:`, shift);
            isValid = false;
          }
        });
        
        if (!isValid) {
          toast.warning('Einige Schichtdaten sind ungültig', {
            description: 'Prüfen Sie die Konsole für Details.'
          });
        }
        
        return isValid;
      }
      
      return false;
    } catch (error) {
      console.error(`Fehler bei der Validierung von ${dataType}:`, error);
      toast.error('Fehler bei der Datenvalidierung');
      return false;
    }
  };
  
  const handleMigration = () => {
    if (activeTab === 'employees') {
      if (validateData('employees')) {
        migrateEmployees();
      }
    } else if (activeTab === 'shifts') {
      if (validateData('shifts')) {
        migrateShifts();
      }
    }
  };
  
  const reset = () => {
    setMigrationStatus('idle');
    setProgress(0);
    setResults({ total: 0, success: 0, failed: 0, skipped: 0 });
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Datenmigration
        </CardTitle>
        <CardDescription>
          Übertragen Sie lokale Daten zum Backend-Server für eine vollständige Migration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees">Mitarbeiter</TabsTrigger>
            <TabsTrigger value="shifts">Schichtplan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees" className="space-y-4">
            <p className="text-sm text-gray-500">
              Migrationstool für Mitarbeiterdaten. Überträgt alle Mitarbeiter aus dem lokalen Speicher in die Datenbank.
            </p>
          </TabsContent>
          
          <TabsContent value="shifts" className="space-y-4">
            <p className="text-sm text-gray-500">
              Migrationstool für Schichtplandaten. Überträgt alle Schichten aus dem lokalen Speicher in die Datenbank.
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 space-y-4">
          {migrationStatus === 'loading' && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Migration läuft...</p>
              <Progress value={progress} className="w-full h-2" />
            </div>
          )}
          
          {migrationStatus === 'success' && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <BadgeCheck className="w-4 h-4 text-green-600" />
              <AlertTitle>Migration erfolgreich</AlertTitle>
              <AlertDescription>
                <p>Die Daten wurden erfolgreich migriert.</p>
                <div className="mt-2 text-sm">
                  <p>Gesamt: {results.total}</p>
                  <p>Erfolgreich: {results.success}</p>
                  {results.skipped > 0 && <p>Übersprungen: {results.skipped}</p>}
                  {results.failed > 0 && <p>Fehlgeschlagen: {results.failed}</p>}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {migrationStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Migration fehlgeschlagen</AlertTitle>
              <AlertDescription>
                Die Daten konnten nicht vollständig migriert werden. Bitte versuchen Sie es erneut.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 justify-end">
            {(migrationStatus === 'success' || migrationStatus === 'error') && (
              <Button variant="outline" onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Zurücksetzen
              </Button>
            )}
            
            <Button 
              onClick={handleMigration} 
              disabled={migrationStatus === 'loading'}
              className="gap-2"
            >
              {migrationStatus === 'loading' ? (
                <>Migriere...</>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Daten migrieren
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataMigrationTool;
