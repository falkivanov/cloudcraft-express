
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime
import uuid

from db import get_db
import models
import schemas

router = APIRouter(
    prefix="/api/v1/shifts",
    tags=["shifts"],
    responses={404: {"description": "Not found"}},
)

# Helper-Funktion zum Konvertieren zwischen DB-Modell und Response-Schema
def shift_db_to_response(shift_db):
    return {
        "id": shift_db.shift_id,
        "employeeId": shift_db.employee_id,
        "date": shift_db.shift_date.isoformat().split("T")[0],
        "startTime": shift_db.start_time,
        "endTime": shift_db.end_time,
        "vehicleId": shift_db.vehicle_id,
        "status": shift_db.status,
        "wave": shift_db.wave,
        "notes": shift_db.notes,
        "created_at": shift_db.created_at.isoformat(),
        "updated_at": shift_db.updated_at.isoformat()
    }

# Konvertieren vom Frontend-Format ins DB-Format
def shift_request_to_db(shift_data):
    # Datumskonvertierung
    shift_date = None
    if "date" in shift_data:
        shift_date = datetime.fromisoformat(shift_data["date"]) if isinstance(shift_data["date"], str) else shift_data["date"]
    
    return {
        "shift_id": shift_data.get("id", str(uuid.uuid4())),
        "employee_id": shift_data.get("employeeId"),
        "shift_date": shift_date,
        "start_time": shift_data.get("startTime"),
        "end_time": shift_data.get("endTime"),
        "vehicle_id": shift_data.get("vehicleId"),
        "status": shift_data.get("status"),
        "wave": shift_data.get("wave"),
        "notes": shift_data.get("notes")
    }

# Alle Schichten abrufen
@router.get("/", response_model=List[dict])
def get_shifts(
    startDate: Optional[str] = None, 
    endDate: Optional[str] = None,
    employeeId: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Shift)
    
    # Filter nach Datum
    if startDate:
        start_date = datetime.fromisoformat(startDate)
        query = query.filter(models.Shift.shift_date >= start_date)
    
    if endDate:
        end_date = datetime.fromisoformat(endDate)
        query = query.filter(models.Shift.shift_date <= end_date)
    
    # Filter nach Mitarbeiter
    if employeeId:
        query = query.filter(models.Shift.employee_id == employeeId)
    
    # Filter nach Status
    if status:
        query = query.filter(models.Shift.status == status)
    
    shifts_db = query.offset(skip).limit(limit).all()
    
    # Konvertieren zum Frontend-Format
    return [shift_db_to_response(shift) for shift in shifts_db]

# Schichten für ein bestimmtes Datum abrufen
@router.get("/date/{date}", response_model=List[dict])
def get_shifts_by_date(date: str, db: Session = Depends(get_db)):
    try:
        query_date = datetime.fromisoformat(date)
        shifts_db = db.query(models.Shift).filter(models.Shift.shift_date == query_date).all()
        
        return [shift_db_to_response(shift) for shift in shifts_db]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ungültiges Datumsformat: {str(e)}")

# Schichten für einen bestimmten Mitarbeiter abrufen
@router.get("/employee/{employee_id}", response_model=List[dict])
def get_shifts_by_employee(employee_id: str, db: Session = Depends(get_db)):
    shifts_db = db.query(models.Shift).filter(models.Shift.employee_id == employee_id).all()
    
    return [shift_db_to_response(shift) for shift in shifts_db]

# Einzelne Schicht abrufen
@router.get("/{shift_id}", response_model=dict)
def get_shift(shift_id: str, db: Session = Depends(get_db)):
    shift_db = db.query(models.Shift).filter(models.Shift.shift_id == shift_id).first()
    if not shift_db:
        raise HTTPException(status_code=404, detail="Schicht nicht gefunden")
    
    return shift_db_to_response(shift_db)

# Neue Schicht erstellen
@router.post("/", response_model=dict)
def create_shift(shift: dict, db: Session = Depends(get_db)):
    db_data = shift_request_to_db(shift)
    
    # Prüfen, ob shift_id bereits existiert
    if db.query(models.Shift).filter(models.Shift.shift_id == db_data["shift_id"]).first():
        raise HTTPException(status_code=400, detail="Schicht-ID existiert bereits")
    
    # Prüfen, ob der Mitarbeiter existiert
    if not db.query(models.Employee).filter(models.Employee.employee_id == db_data["employee_id"]).first():
        raise HTTPException(status_code=400, detail="Mitarbeiter existiert nicht")
    
    # Neue Schicht erstellen
    db_shift = models.Shift(**db_data)
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    
    return shift_db_to_response(db_shift)

# Mehrere Schichten erstellen (Batch)
@router.post("/batch", response_model=dict)
def create_shifts_batch(shifts: List[dict], db: Session = Depends(get_db)):
    created_shifts = []
    skipped_shifts = []
    
    for shift in shifts:
        db_data = shift_request_to_db(shift)
        
        # Prüfen, ob shift_id bereits existiert
        if db.query(models.Shift).filter(models.Shift.shift_id == db_data["shift_id"]).first():
            skipped_shifts.append(shift)
            continue
        
        # Prüfen, ob der Mitarbeiter existiert
        if not db.query(models.Employee).filter(models.Employee.employee_id == db_data["employee_id"]).first():
            skipped_shifts.append(shift)
            continue
        
        # Neue Schicht erstellen
        db_shift = models.Shift(**db_data)
        db.add(db_shift)
        created_shifts.append(db_shift)
    
    db.commit()
    
    # Aktualisieren der Objekte nach dem Commit
    for shift in created_shifts:
        db.refresh(shift)
    
    return {
        "success": True,
        "message": f"{len(created_shifts)} Schichten erstellt, {len(skipped_shifts)} übersprungen",
        "created": [shift_db_to_response(shift) for shift in created_shifts],
        "skipped": len(skipped_shifts)
    }

# Schicht aktualisieren
@router.put("/{shift_id}", response_model=dict)
def update_shift(shift_id: str, shift: dict, db: Session = Depends(get_db)):
    db_shift = db.query(models.Shift).filter(models.Shift.shift_id == shift_id).first()
    if not db_shift:
        raise HTTPException(status_code=404, detail="Schicht nicht gefunden")
    
    # Daten aktualisieren
    db_data = shift_request_to_db(shift)
    
    # shift_id sollte nicht geändert werden
    if "shift_id" in db_data:
        del db_data["shift_id"]
    
    # Prüfen, ob der neue Mitarbeiter existiert (falls geändert)
    if "employee_id" in db_data and db_data["employee_id"] != db_shift.employee_id:
        if not db.query(models.Employee).filter(models.Employee.employee_id == db_data["employee_id"]).first():
            raise HTTPException(status_code=400, detail="Mitarbeiter existiert nicht")
    
    # Aktualisiere alle Felder
    for key, value in db_data.items():
        setattr(db_shift, key, value)
    
    # Aktualisiere updated_at
    db_shift.updated_at = datetime.now()
    
    db.commit()
    db.refresh(db_shift)
    
    return shift_db_to_response(db_shift)

# Schicht löschen
@router.delete("/{shift_id}", response_model=dict)
def delete_shift(shift_id: str, db: Session = Depends(get_db)):
    db_shift = db.query(models.Shift).filter(models.Shift.shift_id == shift_id).first()
    if not db_shift:
        raise HTTPException(status_code=404, detail="Schicht nicht gefunden")
    
    db.delete(db_shift)
    db.commit()
    
    return {"success": True, "message": "Schicht erfolgreich gelöscht"}

# Schichten für einen bestimmten Tag löschen
@router.delete("/date/{date}", response_model=dict)
def delete_shifts_by_date(date: str, db: Session = Depends(get_db)):
    try:
        query_date = datetime.fromisoformat(date)
        count = db.query(models.Shift).filter(models.Shift.shift_date == query_date).delete()
        db.commit()
        
        return {"success": True, "message": f"{count} Schichten erfolgreich gelöscht"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ungültiges Datumsformat: {str(e)}")

# Schichtplan generieren
@router.post("/generate-plan", response_model=dict)
def generate_shift_plan(plan_request: dict, db: Session = Depends(get_db)):
    # Hier würde die komplexe Logik zur Schichtplanung implementiert werden
    # Für diese Demo geben wir eine einfache Antwort mit Dummy-Daten zurück
    
    # Datum aus der Anfrage extrahieren
    date = plan_request.get("date")
    if not date:
        raise HTTPException(status_code=400, detail="Kein Datum angegeben")
    
    # Verfügbare Mitarbeiter abrufen (aktive Mitarbeiter)
    available_employees = db.query(models.Employee).filter(models.Employee.status == "Aktiv").all()
    employee_ids = [emp.employee_id for emp in available_employees]
    
    # Verteilung der Wellen simulieren
    waves = plan_request.get("waves", [])
    wave_distribution = {}
    assignments = []
    unassigned = []
    
    # Einfache Verteilung - in der Realität würde hier ein komplexer Algorithmus stehen
    remaining_employees = employee_ids.copy()
    
    for wave in waves:
        wave_name = wave.get("name", "Default")
        required_drivers = wave.get("requiredDrivers", 0)
        start_time = wave.get("startTime", "08:00")
        
        # Mitarbeiter dieser Welle zuordnen
        wave_employees = []
        for _ in range(min(required_drivers, len(remaining_employees))):
            if remaining_employees:
                employee_id = remaining_employees.pop(0)
                wave_employees.append(employee_id)
                
                # Schichtzuweisung erstellen
                shift_id = str(uuid.uuid4())
                assignments.append({
                    "id": shift_id,
                    "employeeId": employee_id,
                    "date": date,
                    "startTime": start_time,
                    "endTime": "18:00",  # Annahme: Ende nach 10 Stunden
                    "status": "assigned",
                    "wave": wave_name,
                    "notes": f"Automatisch zugewiesen zu Welle {wave_name}",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                })
        
        wave_distribution[wave_name] = wave_employees
    
    # Nicht zugeordnete Mitarbeiter
    unassigned = remaining_employees
    
    return {
        "success": True,
        "date": date,
        "assignments": assignments,
        "unassignedEmployees": unassigned,
        "waveDistribution": wave_distribution
    }
