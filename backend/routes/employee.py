
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from db import get_db
import models
import schemas

router = APIRouter(
    prefix="/api/v1/employees",
    tags=["employees"],
    responses={404: {"description": "Not found"}},
)

# Helper-Funktion zum Konvertieren zwischen DB-Modell und Response-Schema
def employee_db_to_response(employee_db):
    # Konvertieren der bevorzugten Arbeitstage von JSON-String zur Liste
    preferred_working_days = []
    if employee_db.preferred_working_days:
        try:
            preferred_working_days = json.loads(employee_db.preferred_working_days)
        except:
            preferred_working_days = []
    
    return {
        "id": employee_db.employee_id,  # Wir verwenden employee_id als id für das Frontend
        "name": employee_db.name,
        "email": employee_db.email,
        "phone": employee_db.phone,
        "status": employee_db.status,
        "transporterId": employee_db.transporter_id,
        "startDate": employee_db.start_date.isoformat().split("T")[0],
        "endDate": employee_db.end_date.isoformat().split("T")[0] if employee_db.end_date else None,
        "address": employee_db.address,
        "telegramUsername": employee_db.telegram_username,
        "workingDaysAWeek": employee_db.working_days_a_week,
        "preferredVehicle": employee_db.preferred_vehicle,
        "preferredWorkingDays": preferred_working_days,
        "wantsToWorkSixDays": employee_db.wants_to_work_six_days,
        "isWorkingDaysFlexible": employee_db.is_working_days_flexible,
        "mentorFirstName": employee_db.mentor_first_name,
        "mentorLastName": employee_db.mentor_last_name,
        "created_at": employee_db.created_at.isoformat(),
        "updated_at": employee_db.updated_at.isoformat()
    }

# Konvertieren vom Frontend-Format ins DB-Format
def employee_request_to_db(employee_data):
    # Konvertieren der bevorzugten Arbeitstage in JSON-String
    preferred_working_days = json.dumps(employee_data.get("preferredWorkingDays", []))
    
    # Datumskonvertierung
    start_date = None
    if "startDate" in employee_data:
        start_date = datetime.fromisoformat(employee_data["startDate"]) if isinstance(employee_data["startDate"], str) else employee_data["startDate"]
    
    end_date = None
    if "endDate" in employee_data and employee_data["endDate"]:
        end_date = datetime.fromisoformat(employee_data["endDate"]) if isinstance(employee_data["endDate"], str) else employee_data["endDate"]
    
    return {
        "employee_id": employee_data.get("id"),
        "name": employee_data.get("name"),
        "email": employee_data.get("email"),
        "phone": employee_data.get("phone"),
        "status": employee_data.get("status"),
        "transporter_id": employee_data.get("transporterId"),
        "start_date": start_date,
        "end_date": end_date,
        "address": employee_data.get("address"),
        "telegram_username": employee_data.get("telegramUsername"),
        "working_days_a_week": employee_data.get("workingDaysAWeek", 5),
        "preferred_vehicle": employee_data.get("preferredVehicle"),
        "preferred_working_days": preferred_working_days,
        "wants_to_work_six_days": employee_data.get("wantsToWorkSixDays", False),
        "is_working_days_flexible": employee_data.get("isWorkingDaysFlexible", True),
        "mentor_first_name": employee_data.get("mentorFirstName"),
        "mentor_last_name": employee_data.get("mentorLastName")
    }

# Alle Mitarbeiter abrufen
@router.get("/", response_model=List[dict])
def get_employees(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Employee)
    
    # Filter nach Status
    if status:
        query = query.filter(models.Employee.status == status)
    
    # Suche nach Namen oder Email
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Employee.name.ilike(search_term)) |
            (models.Employee.email.ilike(search_term)) |
            (models.Employee.phone.ilike(search_term))
        )
    
    employees_db = query.offset(skip).limit(limit).all()
    
    # Konvertieren zum Frontend-Format
    return [employee_db_to_response(employee) for employee in employees_db]

# Einzelnen Mitarbeiter abrufen
@router.get("/{employee_id}", response_model=dict)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee_db = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee_db:
        raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")
    
    return employee_db_to_response(employee_db)

# Neuen Mitarbeiter erstellen
@router.post("/", response_model=dict)
def create_employee(employee: dict, db: Session = Depends(get_db)):
    db_data = employee_request_to_db(employee)
    
    # Prüfen, ob employee_id bereits existiert
    if db.query(models.Employee).filter(models.Employee.employee_id == db_data["employee_id"]).first():
        raise HTTPException(status_code=400, detail="Mitarbeiter-ID existiert bereits")
    
    # Neuen Mitarbeiter erstellen
    db_employee = models.Employee(**db_data)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    
    return employee_db_to_response(db_employee)

# Mehrere Mitarbeiter erstellen (Import)
@router.post("/batch", response_model=dict)
def create_employees_batch(employees: List[dict], db: Session = Depends(get_db)):
    created_employees = []
    skipped_employees = []
    
    for employee in employees:
        db_data = employee_request_to_db(employee)
        
        # Prüfen, ob employee_id bereits existiert
        if db.query(models.Employee).filter(models.Employee.employee_id == db_data["employee_id"]).first():
            skipped_employees.append(employee)
            continue
        
        # Neuen Mitarbeiter erstellen
        db_employee = models.Employee(**db_data)
        db.add(db_employee)
        created_employees.append(db_employee)
    
    db.commit()
    
    # Aktualisieren der Objekte nach dem Commit
    for employee in created_employees:
        db.refresh(employee)
    
    return {
        "success": True,
        "message": f"{len(created_employees)} Mitarbeiter erstellt, {len(skipped_employees)} übersprungen",
        "created": [employee_db_to_response(employee) for employee in created_employees],
        "skipped": len(skipped_employees)
    }

# Mitarbeiter aktualisieren
@router.put("/{employee_id}", response_model=dict)
def update_employee(employee_id: str, employee: dict, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")
    
    # Daten aktualisieren
    db_data = employee_request_to_db(employee)
    
    # employee_id sollte nicht geändert werden
    if "employee_id" in db_data:
        del db_data["employee_id"]
    
    # Aktualisiere alle Felder
    for key, value in db_data.items():
        setattr(db_employee, key, value)
    
    # Aktualisiere updated_at
    db_employee.updated_at = datetime.now()
    
    db.commit()
    db.refresh(db_employee)
    
    return employee_db_to_response(db_employee)

# Mitarbeiter löschen
@router.delete("/{employee_id}", response_model=dict)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")
    
    db.delete(db_employee)
    db.commit()
    
    return {"success": True, "message": "Mitarbeiter erfolgreich gelöscht"}

# Alle Mitarbeiter löschen
@router.delete("/", response_model=dict)
def delete_all_employees(db: Session = Depends(get_db)):
    count = db.query(models.Employee).delete()
    db.commit()
    
    return {"success": True, "message": f"{count} Mitarbeiter erfolgreich gelöscht"}
