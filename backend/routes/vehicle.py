
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from db import get_db
import models
import schemas

router = APIRouter(
    prefix="/api/v1/vehicles",
    tags=["vehicles"],
    responses={404: {"description": "Not found"}},
)

# Helper-Funktion zum Konvertieren zwischen DB-Modell und Response-Schema
def vehicle_db_to_response(vehicle_db):
    return {
        "id": vehicle_db.vehicle_id,
        "licensePlate": vehicle_db.license_plate,
        "brand": vehicle_db.brand,
        "model": vehicle_db.model,
        "vinNumber": vehicle_db.vin_number,
        "status": vehicle_db.status,
        "infleetDate": vehicle_db.infleet_date.isoformat().split("T")[0],
        "defleetDate": vehicle_db.defleet_date.isoformat().split("T")[0] if vehicle_db.defleet_date else None,
        "created_at": vehicle_db.created_at.isoformat(),
        "updated_at": vehicle_db.updated_at.isoformat()
    }

# Helper-Funktion zum Konvertieren von Reparatur-DB-Modell zu Response
def repair_db_to_response(repair_db):
    return {
        "id": repair_db.repair_id,
        "date": repair_db.start_date.isoformat().split("T")[0],  # Für Kompatibilität mit Frontend
        "startDate": repair_db.start_date.isoformat().split("T")[0],
        "endDate": repair_db.end_date.isoformat().split("T")[0],
        "description": repair_db.description,
        "location": repair_db.location,
        "duration": repair_db.duration,
        "totalCost": float(repair_db.total_cost),
        "companyPaidAmount": float(repair_db.company_paid_amount),
        "causeType": repair_db.cause_type,
        "causedByEmployeeId": repair_db.caused_by_employee_id,
        "causedByEmployeeName": "",  # Muss später gefüllt werden, wenn Employee abgefragt wird
        "created_at": repair_db.created_at.isoformat(),
        "updated_at": repair_db.updated_at.isoformat()
    }

# Helper-Funktion zum Konvertieren von Appointment-DB-Modell zu Response
def appointment_db_to_response(appointment_db):
    return {
        "id": appointment_db.appointment_id,
        "date": appointment_db.appointment_date.isoformat().split("T")[0],
        "time": appointment_db.time,
        "description": appointment_db.description,
        "location": appointment_db.location,
        "appointmentType": appointment_db.appointment_type,
        "completed": appointment_db.completed,
        "created_at": appointment_db.created_at.isoformat(),
        "updated_at": appointment_db.updated_at.isoformat()
    }

# Helper-Funktion zum Konvertieren vom Request ins DB-Format
def vehicle_request_to_db(vehicle_data):
    infleet_date = None
    if "infleetDate" in vehicle_data:
        infleet_date = datetime.fromisoformat(vehicle_data["infleetDate"]) if isinstance(vehicle_data["infleetDate"], str) else vehicle_data["infleetDate"]
    
    defleet_date = None
    if "defleetDate" in vehicle_data and vehicle_data["defleetDate"]:
        defleet_date = datetime.fromisoformat(vehicle_data["defleetDate"]) if isinstance(vehicle_data["defleetDate"], str) else vehicle_data["defleetDate"]
    
    return {
        "vehicle_id": vehicle_data.get("id", str(uuid.uuid4())),
        "license_plate": vehicle_data.get("licensePlate"),
        "brand": vehicle_data.get("brand"),
        "model": vehicle_data.get("model"),
        "vin_number": vehicle_data.get("vinNumber"),
        "status": vehicle_data.get("status", "Aktiv"),
        "infleet_date": infleet_date,
        "defleet_date": defleet_date
    }

# Alle Fahrzeuge abrufen
@router.get("/", response_model=List[dict])
def get_vehicles(
    status: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Vehicle)
    
    # Filter nach Status
    if status:
        query = query.filter(models.Vehicle.status == status)
    
    # Filter nach Marke
    if brand:
        query = query.filter(models.Vehicle.brand == brand)
    
    # Suche nach Kennzeichen oder VIN
    if search:
        query = query.filter(
            (models.Vehicle.license_plate.contains(search)) |
            (models.Vehicle.vin_number.contains(search)) |
            (models.Vehicle.brand.contains(search)) |
            (models.Vehicle.model.contains(search))
        )
    
    vehicles_db = query.offset(skip).limit(limit).all()
    
    # Konvertieren zum Frontend-Format
    return [vehicle_db_to_response(vehicle) for vehicle in vehicles_db]

# Einzelnes Fahrzeug abrufen
@router.get("/{vehicle_id}", response_model=dict)
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle_db = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle_db:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    response = vehicle_db_to_response(vehicle_db)
    
    # Reparaturen und Termine hinzufügen
    repairs = db.query(models.Repair).filter(models.Repair.vehicle_id == vehicle_id).all()
    appointments = db.query(models.Appointment).filter(models.Appointment.vehicle_id == vehicle_id).all()
    
    response["repairs"] = [repair_db_to_response(repair) for repair in repairs]
    response["appointments"] = [appointment_db_to_response(appointment) for appointment in appointments]
    
    # Für Reparaturen, die von einem Mitarbeiter verursacht wurden, den Namen abrufen
    for repair in response["repairs"]:
        if repair["causedByEmployeeId"]:
            employee = db.query(models.Employee).filter(models.Employee.employee_id == repair["causedByEmployeeId"]).first()
            if employee:
                repair["causedByEmployeeName"] = employee.name
    
    return response

# Neues Fahrzeug erstellen
@router.post("/", response_model=dict)
def create_vehicle(vehicle: dict, db: Session = Depends(get_db)):
    db_data = vehicle_request_to_db(vehicle)
    
    # Prüfen, ob Kennzeichen oder VIN bereits existiert
    if db.query(models.Vehicle).filter(models.Vehicle.license_plate == db_data["license_plate"]).first():
        raise HTTPException(status_code=400, detail="Kennzeichen existiert bereits")
    
    if db.query(models.Vehicle).filter(models.Vehicle.vin_number == db_data["vin_number"]).first():
        raise HTTPException(status_code=400, detail="Fahrgestellnummer existiert bereits")
    
    # Neues Fahrzeug erstellen
    db_vehicle = models.Vehicle(**db_data)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    
    return vehicle_db_to_response(db_vehicle)

# Fahrzeug aktualisieren
@router.put("/{vehicle_id}", response_model=dict)
def update_vehicle(vehicle_id: str, vehicle: dict, db: Session = Depends(get_db)):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    db_data = vehicle_request_to_db(vehicle)
    
    # vehicle_id sollte nicht geändert werden
    if "vehicle_id" in db_data:
        del db_data["vehicle_id"]
    
    # Prüfen, ob neues Kennzeichen oder VIN bereits existiert (aber nicht bei diesem Fahrzeug)
    if "license_plate" in db_data and db_data["license_plate"] != db_vehicle.license_plate:
        if db.query(models.Vehicle).filter(models.Vehicle.license_plate == db_data["license_plate"]).first():
            raise HTTPException(status_code=400, detail="Kennzeichen existiert bereits bei einem anderen Fahrzeug")
    
    if "vin_number" in db_data and db_data["vin_number"] != db_vehicle.vin_number:
        if db.query(models.Vehicle).filter(models.Vehicle.vin_number == db_data["vin_number"]).first():
            raise HTTPException(status_code=400, detail="Fahrgestellnummer existiert bereits bei einem anderen Fahrzeug")
    
    # Aktualisiere alle Felder
    for key, value in db_data.items():
        setattr(db_vehicle, key, value)
    
    db_vehicle.updated_at = datetime.now()
    db.commit()
    db.refresh(db_vehicle)
    
    return vehicle_db_to_response(db_vehicle)

# Fahrzeug löschen
@router.delete("/{vehicle_id}", response_model=dict)
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    # Prüfen, ob Reparaturen oder Termine existieren
    repairs = db.query(models.Repair).filter(models.Repair.vehicle_id == vehicle_id).all()
    appointments = db.query(models.Appointment).filter(models.Appointment.vehicle_id == vehicle_id).all()
    
    if repairs or appointments:
        # Statt zu löschen, als "Defleet" markieren
        db_vehicle.status = "Defleet"
        db_vehicle.defleet_date = datetime.now()
        db_vehicle.updated_at = datetime.now()
        db.commit()
        db.refresh(db_vehicle)
        
        return {
            "success": True, 
            "message": "Fahrzeug wurde als Defleet markiert, da noch Reparaturen oder Termine existieren"
        }
    
    # Fahrzeug löschen, wenn keine Abhängigkeiten existieren
    db.delete(db_vehicle)
    db.commit()
    
    return {"success": True, "message": "Fahrzeug erfolgreich gelöscht"}

# Mehrere Fahrzeuge erstellen (Import)
@router.post("/batch", response_model=dict)
def create_vehicles_batch(vehicles: List[dict], db: Session = Depends(get_db)):
    created_vehicles = []
    skipped_vehicles = []
    
    for vehicle in vehicles:
        try:
            db_data = vehicle_request_to_db(vehicle)
            
            # Prüfen, ob Kennzeichen oder VIN bereits existiert
            if db.query(models.Vehicle).filter(models.Vehicle.license_plate == db_data["license_plate"]).first():
                skipped_vehicles.append({"vehicle": vehicle, "reason": "Kennzeichen existiert bereits"})
                continue
            
            if db.query(models.Vehicle).filter(models.Vehicle.vin_number == db_data["vin_number"]).first():
                skipped_vehicles.append({"vehicle": vehicle, "reason": "Fahrgestellnummer existiert bereits"})
                continue
            
            # Neues Fahrzeug erstellen
            db_vehicle = models.Vehicle(**db_data)
            db.add(db_vehicle)
            created_vehicles.append(db_vehicle)
        except Exception as e:
            skipped_vehicles.append({"vehicle": vehicle, "reason": str(e)})
    
    db.commit()
    
    # Aktualisieren der Objekte nach dem Commit
    for vehicle in created_vehicles:
        db.refresh(vehicle)
    
    return {
        "success": True,
        "message": f"{len(created_vehicles)} Fahrzeuge erstellt, {len(skipped_vehicles)} übersprungen",
        "created": [vehicle_db_to_response(vehicle) for vehicle in created_vehicles],
        "skipped": len(skipped_vehicles),
        "skippedDetails": skipped_vehicles
    }

# Reparatur zu einem Fahrzeug hinzufügen
@router.post("/{vehicle_id}/repairs", response_model=dict)
def add_repair(vehicle_id: str, repair: dict, db: Session = Depends(get_db)):
    # Prüfen, ob das Fahrzeug existiert
    vehicle_db = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle_db:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    # Daten validieren und konvertieren
    try:
        start_date = datetime.fromisoformat(repair["startDate"])
        end_date = datetime.fromisoformat(repair["endDate"])
        
        # Dauer berechnen (in Tagen)
        duration = (end_date - start_date).days + 1  # +1, um den ersten Tag mitzuzählen
        
        # Prüfen, ob Mitarbeiter existiert, falls angegeben
        if repair.get("causedByEmployeeId"):
            employee = db.query(models.Employee).filter(
                models.Employee.employee_id == repair["causedByEmployeeId"]
            ).first()
            if not employee:
                raise HTTPException(status_code=400, detail="Angegebener Mitarbeiter existiert nicht")
        
        # Neue Reparatur erstellen
        new_repair = models.Repair(
            repair_id=str(uuid.uuid4()),
            vehicle_id=vehicle_id,
            start_date=start_date,
            end_date=end_date,
            description=repair["description"],
            location=repair["location"],
            duration=duration,
            total_cost=float(repair["totalCost"]),
            company_paid_amount=float(repair["companyPaidAmount"]),
            cause_type=repair["causeType"],
            caused_by_employee_id=repair.get("causedByEmployeeId")
        )
        
        # Fahrzeugstatus aktualisieren, wenn es eine aktuelle Reparatur ist
        today = datetime.now().date()
        if start_date.date() <= today <= end_date.date():
            vehicle_db.status = "In Werkstatt"
            vehicle_db.updated_at = datetime.now()
        
        db.add(new_repair)
        db.commit()
        db.refresh(new_repair)
        
        # Reparatur zum Response-Format konvertieren
        response = repair_db_to_response(new_repair)
        
        # Name des Mitarbeiters hinzufügen, falls vorhanden
        if new_repair.caused_by_employee_id:
            employee = db.query(models.Employee).filter(
                models.Employee.employee_id == new_repair.caused_by_employee_id
            ).first()
            if employee:
                response["causedByEmployeeName"] = employee.name
        
        return response
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Fehlender Pflichtparameter: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Ungültiges Datumsformat: {str(e)}")

# Termin zu einem Fahrzeug hinzufügen
@router.post("/{vehicle_id}/appointments", response_model=dict)
def add_appointment(vehicle_id: str, appointment: dict, db: Session = Depends(get_db)):
    # Prüfen, ob das Fahrzeug existiert
    vehicle_db = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle_db:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    # Daten validieren und konvertieren
    try:
        appointment_date = datetime.fromisoformat(appointment["date"])
        
        # Neuen Termin erstellen
        new_appointment = models.Appointment(
            appointment_id=str(uuid.uuid4()),
            vehicle_id=vehicle_id,
            appointment_date=appointment_date,
            time=appointment["time"],
            description=appointment["description"],
            location=appointment["location"],
            appointment_type=appointment["appointmentType"],
            completed=appointment.get("completed", False)
        )
        
        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)
        
        return appointment_db_to_response(new_appointment)
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Fehlender Pflichtparameter: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Ungültiges Datumsformat: {str(e)}")

# Reparatur aktualisieren
@router.put("/repairs/{repair_id}", response_model=dict)
def update_repair(repair_id: str, repair: dict, db: Session = Depends(get_db)):
    # Prüfen, ob die Reparatur existiert
    repair_db = db.query(models.Repair).filter(models.Repair.repair_id == repair_id).first()
    if not repair_db:
        raise HTTPException(status_code=404, detail="Reparatur nicht gefunden")
    
    try:
        # Daten aktualisieren
        if "startDate" in repair:
            repair_db.start_date = datetime.fromisoformat(repair["startDate"])
        
        if "endDate" in repair:
            repair_db.end_date = datetime.fromisoformat(repair["endDate"])
        
        # Dauer neu berechnen
        repair_db.duration = (repair_db.end_date - repair_db.start_date).days + 1
        
        if "description" in repair:
            repair_db.description = repair["description"]
        
        if "location" in repair:
            repair_db.location = repair["location"]
        
        if "totalCost" in repair:
            repair_db.total_cost = float(repair["totalCost"])
        
        if "companyPaidAmount" in repair:
            repair_db.company_paid_amount = float(repair["companyPaidAmount"])
        
        if "causeType" in repair:
            repair_db.cause_type = repair["causeType"]
        
        if "causedByEmployeeId" in repair:
            # Prüfen, ob der Mitarbeiter existiert
            if repair["causedByEmployeeId"]:
                employee = db.query(models.Employee).filter(
                    models.Employee.employee_id == repair["causedByEmployeeId"]
                ).first()
                if not employee:
                    raise HTTPException(status_code=400, detail="Angegebener Mitarbeiter existiert nicht")
            
            repair_db.caused_by_employee_id = repair["causedByEmployeeId"]
        
        # Fahrzeugstatus aktualisieren
        vehicle = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == repair_db.vehicle_id).first()
        if vehicle:
            today = datetime.now().date()
            if repair_db.start_date.date() <= today <= repair_db.end_date.date():
                vehicle.status = "In Werkstatt"
            else:
                # Prüfen, ob es andere aktuelle Reparaturen gibt
                other_current_repairs = db.query(models.Repair).filter(
                    models.Repair.vehicle_id == vehicle.vehicle_id,
                    models.Repair.repair_id != repair_id,
                    models.Repair.start_date <= today,
                    models.Repair.end_date >= today
                ).first()
                
                if not other_current_repairs and vehicle.status == "In Werkstatt":
                    vehicle.status = "Aktiv"
            
            vehicle.updated_at = datetime.now()
        
        repair_db.updated_at = datetime.now()
        db.commit()
        db.refresh(repair_db)
        
        # Response erstellen
        response = repair_db_to_response(repair_db)
        
        # Name des Mitarbeiters hinzufügen, falls vorhanden
        if repair_db.caused_by_employee_id:
            employee = db.query(models.Employee).filter(
                models.Employee.employee_id == repair_db.caused_by_employee_id
            ).first()
            if employee:
                response["causedByEmployeeName"] = employee.name
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Ungültiges Datumsformat: {str(e)}")

# Termin aktualisieren
@router.put("/appointments/{appointment_id}", response_model=dict)
def update_appointment(appointment_id: str, appointment: dict, db: Session = Depends(get_db)):
    # Prüfen, ob der Termin existiert
    appointment_db = db.query(models.Appointment).filter(models.Appointment.appointment_id == appointment_id).first()
    if not appointment_db:
        raise HTTPException(status_code=404, detail="Termin nicht gefunden")
    
    try:
        # Daten aktualisieren
        if "date" in appointment:
            appointment_db.appointment_date = datetime.fromisoformat(appointment["date"])
        
        if "time" in appointment:
            appointment_db.time = appointment["time"]
        
        if "description" in appointment:
            appointment_db.description = appointment["description"]
        
        if "location" in appointment:
            appointment_db.location = appointment["location"]
        
        if "appointmentType" in appointment:
            appointment_db.appointment_type = appointment["appointmentType"]
        
        if "completed" in appointment:
            appointment_db.completed = appointment["completed"]
        
        appointment_db.updated_at = datetime.now()
        db.commit()
        db.refresh(appointment_db)
        
        return appointment_db_to_response(appointment_db)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Ungültiges Datumsformat: {str(e)}")

# Reparatur löschen
@router.delete("/repairs/{repair_id}", response_model=dict)
def delete_repair(repair_id: str, db: Session = Depends(get_db)):
    # Prüfen, ob die Reparatur existiert
    repair_db = db.query(models.Repair).filter(models.Repair.repair_id == repair_id).first()
    if not repair_db:
        raise HTTPException(status_code=404, detail="Reparatur nicht gefunden")
    
    # Speichern der Fahrzeug-ID, bevor die Reparatur gelöscht wird
    vehicle_id = repair_db.vehicle_id
    
    # Reparatur löschen
    db.delete(repair_db)
    db.commit()
    
    # Fahrzeugstatus aktualisieren
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == vehicle_id).first()
    if vehicle and vehicle.status == "In Werkstatt":
        # Prüfen, ob es andere aktuelle Reparaturen gibt
        today = datetime.now().date()
        other_current_repairs = db.query(models.Repair).filter(
            models.Repair.vehicle_id == vehicle_id,
            models.Repair.start_date <= today,
            models.Repair.end_date >= today
        ).first()
        
        if not other_current_repairs:
            vehicle.status = "Aktiv"
            vehicle.updated_at = datetime.now()
            db.commit()
    
    return {"success": True, "message": "Reparatur erfolgreich gelöscht"}

# Termin löschen
@router.delete("/appointments/{appointment_id}", response_model=dict)
def delete_appointment(appointment_id: str, db: Session = Depends(get_db)):
    # Prüfen, ob der Termin existiert
    appointment_db = db.query(models.Appointment).filter(models.Appointment.appointment_id == appointment_id).first()
    if not appointment_db:
        raise HTTPException(status_code=404, detail="Termin nicht gefunden")
    
    # Termin löschen
    db.delete(appointment_db)
    db.commit()
    
    return {"success": True, "message": "Termin erfolgreich gelöscht"}

# Alle Reparaturen abrufen
@router.get("/repairs/all", response_model=List[dict])
def get_all_repairs(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Repair)
    
    # Filter nach Zeitraum
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(models.Repair.start_date >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(models.Repair.end_date <= end)
    
    # Filter nach Fahrzeug
    if vehicle_id:
        query = query.filter(models.Repair.vehicle_id == vehicle_id)
    
    repairs_db = query.order_by(models.Repair.start_date.desc()).offset(skip).limit(limit).all()
    
    # Konvertieren zum Frontend-Format und Fahrzeuginformationen hinzufügen
    result = []
    for repair in repairs_db:
        repair_data = repair_db_to_response(repair)
        
        # Fahrzeuginformationen hinzufügen
        vehicle = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == repair.vehicle_id).first()
        if vehicle:
            repair_data["vehicleInfo"] = f"{vehicle.brand} {vehicle.model} ({vehicle.license_plate})"
        
        # Mitarbeiterinformationen hinzufügen, falls vorhanden
        if repair.caused_by_employee_id:
            employee = db.query(models.Employee).filter(
                models.Employee.employee_id == repair.caused_by_employee_id
            ).first()
            if employee:
                repair_data["causedByEmployeeName"] = employee.name
        
        result.append(repair_data)
    
    return result

# Alle Termine abrufen
@router.get("/appointments/all", response_model=List[dict])
def get_all_appointments(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    completed: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Appointment)
    
    # Filter nach Zeitraum
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(models.Appointment.appointment_date >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(models.Appointment.appointment_date <= end)
    
    # Filter nach Fahrzeug
    if vehicle_id:
        query = query.filter(models.Appointment.vehicle_id == vehicle_id)
    
    # Filter nach Status (abgeschlossen oder nicht)
    if completed is not None:
        query = query.filter(models.Appointment.completed == completed)
    
    appointments_db = query.order_by(models.Appointment.appointment_date).offset(skip).limit(limit).all()
    
    # Konvertieren zum Frontend-Format und Fahrzeuginformationen hinzufügen
    result = []
    for appointment in appointments_db:
        appointment_data = appointment_db_to_response(appointment)
        
        # Fahrzeuginformationen hinzufügen
        vehicle = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == appointment.vehicle_id).first()
        if vehicle:
            appointment_data["vehicleInfo"] = f"{vehicle.brand} {vehicle.model} ({vehicle.license_plate})"
        
        result.append(appointment_data)
    
    return result

# Fahrzeugzuweisungen abrufen
@router.get("/assignments", response_model=List[dict])
def get_vehicle_assignments(
    date: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    employee_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.VehicleAssignment)
    
    # Filter nach Datum
    if date:
        assignment_date = datetime.fromisoformat(date)
        query = query.filter(models.VehicleAssignment.assignment_date == assignment_date)
    
    # Filter nach Fahrzeug
    if vehicle_id:
        query = query.filter(models.VehicleAssignment.vehicle_id == vehicle_id)
    
    # Filter nach Mitarbeiter
    if employee_id:
        query = query.filter(models.VehicleAssignment.employee_id == employee_id)
    
    assignments_db = query.offset(skip).limit(limit).all()
    
    # Konvertieren zum Frontend-Format und zusätzliche Informationen hinzufügen
    result = []
    for assignment in assignments_db:
        assignment_data = {
            "id": assignment.assignment_id,
            "date": assignment.assignment_date.isoformat().split("T")[0],
            "employeeId": assignment.employee_id,
            "vehicleId": assignment.vehicle_id,
            "assignedAt": assignment.created_at.isoformat(),
            "assignedBy": assignment.assigned_by,
        }
        
        # Fahrzeuginformationen hinzufügen
        vehicle = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == assignment.vehicle_id).first()
        if vehicle:
            assignment_data["vehicleInfo"] = f"{vehicle.brand} {vehicle.model} ({vehicle.license_plate})"
        
        # Mitarbeiterinformationen hinzufügen
        employee = db.query(models.Employee).filter(models.Employee.employee_id == assignment.employee_id).first()
        if employee:
            assignment_data["employeeName"] = employee.name
        
        result.append(assignment_data)
    
    return result

# Fahrzeugzuweisung erstellen
@router.post("/assignments", response_model=dict)
def create_vehicle_assignment(assignment: dict, db: Session = Depends(get_db)):
    # Prüfen, ob das Fahrzeug existiert
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == assignment["vehicleId"]).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Fahrzeug nicht gefunden")
    
    # Prüfen, ob der Mitarbeiter existiert
    employee = db.query(models.Employee).filter(models.Employee.employee_id == assignment["employeeId"]).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")
    
    # Datum konvertieren
    try:
        assignment_date = datetime.fromisoformat(assignment["date"])
    except ValueError:
        raise HTTPException(status_code=400, detail="Ungültiges Datumsformat")
    
    # Prüfen, ob bereits eine Zuweisung für diesen Mitarbeiter an diesem Tag existiert
    existing_assignment = db.query(models.VehicleAssignment).filter(
        models.VehicleAssignment.employee_id == assignment["employeeId"],
        models.VehicleAssignment.assignment_date == assignment_date
    ).first()
    
    if existing_assignment:
        # Bestehende Zuweisung aktualisieren
        existing_assignment.vehicle_id = assignment["vehicleId"]
        existing_assignment.assigned_by = assignment["assignedBy"]
        existing_assignment.updated_at = datetime.now()
        db.commit()
        db.refresh(existing_assignment)
        
        return {
            "id": existing_assignment.assignment_id,
            "date": existing_assignment.assignment_date.isoformat().split("T")[0],
            "employeeId": existing_assignment.employee_id,
            "employeeName": employee.name,
            "vehicleId": existing_assignment.vehicle_id,
            "vehicleInfo": f"{vehicle.brand} {vehicle.model} ({vehicle.license_plate})",
            "assignedAt": existing_assignment.updated_at.isoformat(),
            "assignedBy": existing_assignment.assigned_by,
            "message": "Bestehende Zuweisung aktualisiert"
        }
    
    # Neue Zuweisung erstellen
    new_assignment = models.VehicleAssignment(
        assignment_id=str(uuid.uuid4()),
        vehicle_id=assignment["vehicleId"],
        employee_id=assignment["employeeId"],
        assignment_date=assignment_date,
        assigned_by=assignment["assignedBy"]
    )
    
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    
    return {
        "id": new_assignment.assignment_id,
        "date": new_assignment.assignment_date.isoformat().split("T")[0],
        "employeeId": new_assignment.employee_id,
        "employeeName": employee.name,
        "vehicleId": new_assignment.vehicle_id,
        "vehicleInfo": f"{vehicle.brand} {vehicle.model} ({vehicle.license_plate})",
        "assignedAt": new_assignment.created_at.isoformat(),
        "assignedBy": new_assignment.assigned_by,
        "message": "Neue Zuweisung erstellt"
    }

# Fahrzeugzuweisung löschen
@router.delete("/assignments/{assignment_id}", response_model=dict)
def delete_vehicle_assignment(assignment_id: str, db: Session = Depends(get_db)):
    # Prüfen, ob die Zuweisung existiert
    assignment = db.query(models.VehicleAssignment).filter(models.VehicleAssignment.assignment_id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Zuweisung nicht gefunden")
    
    # Zuweisung löschen
    db.delete(assignment)
    db.commit()
    
    return {"success": True, "message": "Zuweisung erfolgreich gelöscht"}
