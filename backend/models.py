from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()

# Hilfsfunktion zur Generierung einer UUID
def generate_uuid():
    return str(uuid.uuid4())

# Mitarbeiter-Tabelle
class Employee(Base):
    __tablename__ = "employees"

    # Primärschlüssel - wir verwenden UUIDs (als Strings gespeichert)
    employee_id = Column(String(36), primary_key=True, default=generate_uuid)
    
    # Persönliche Informationen
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="Aktiv") # z.B. Aktiv, Inaktiv, Gekündigt
    
    # Beschäftigungsdetails
    transporter_id = Column(String(50), nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    address = Column(String(512), nullable=True)
    telegram_username = Column(String(100), nullable=True)
    
    # Arbeitspräferenzen
    working_days_a_week = Column(Integer, default=5)
    preferred_vehicle = Column(String(255), nullable=True)
    preferred_working_days = Column(Text, nullable=True)  # JSON-String: ["Monday", "Tuesday", ...]
    wants_to_work_six_days = Column(Boolean, default=False)
    is_working_days_flexible = Column(Boolean, default=True)
    
    # Mentoring
    mentor_first_name = Column(String(255), nullable=True)
    mentor_last_name = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Beziehungen
    # shifts = relationship("Shift", back_populates="employee")
    # vehicle_assignments = relationship("VehicleAssignment", back_populates="employee")

# Schicht-Tabelle
class Shift(Base):
    __tablename__ = "shifts"

    # Primärschlüssel - wieder UUIDs
    shift_id = Column(String(36), primary_key=True, default=generate_uuid)
    
    # Beziehung zum Mitarbeiter
    employee_id = Column(String(36), ForeignKey("employees.employee_id"), nullable=False)
    
    # Schichtdetails
    shift_date = Column(DateTime, nullable=False)
    start_time = Column(String(10), nullable=False)  # Format: "HH:MM"
    end_time = Column(String(10), nullable=False)    # Format: "HH:MM"
    vehicle_id = Column(String(36), nullable=True)   # Optional: Zugewiesenes Fahrzeug
    status = Column(String(20), nullable=False)      # z.B. assigned, completed, cancelled
    wave = Column(String(50), nullable=True)         # Optional: Welle/Gruppe
    notes = Column(Text, nullable=True)              # Optionale Notizen
    shift_type = Column(String(20), nullable=True)   # z.B. Arbeit, Frei, Termin, Urlaub, Krank
    confirmed = Column(Boolean, default=False)       # Bestätigt vom Mitarbeiter
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Beziehung
    # employee = relationship("Employee", back_populates="shifts")

# Fahrzeug-Tabelle
class Vehicle(Base):
    __tablename__ = "vehicles"
    
    # Primärschlüssel
    vehicle_id = Column(String(36), primary_key=True, default=generate_uuid)
    
    # Fahrzeugdetails
    license_plate = Column(String(20), nullable=False, unique=True)  # Kennzeichen
    brand = Column(String(100), nullable=False)                      # Marke
    model = Column(String(100), nullable=False)                      # Modell
    vin_number = Column(String(100), nullable=False, unique=True)    # Fahrgestellnummer
    
    # Status und Daten
    status = Column(String(20), nullable=False, default="Aktiv")     # Aktiv, In Werkstatt, Defleet
    infleet_date = Column(DateTime, nullable=False)                  # Datum der Inbetriebnahme
    defleet_date = Column(DateTime, nullable=True)                   # Datum der Außerbetriebnahme
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Beziehungen
    repairs = relationship("Repair", back_populates="vehicle")
    appointments = relationship("Appointment", back_populates="vehicle")
    # assignments = relationship("VehicleAssignment", back_populates="vehicle")

# Reparatur-Tabelle
class Repair(Base):
    __tablename__ = "repairs"
    
    # Primärschlüssel
    repair_id = Column(String(36), primary_key=True, default=generate_uuid)
    
    # Beziehung zum Fahrzeug
    vehicle_id = Column(String(36), ForeignKey("vehicles.vehicle_id"), nullable=False)
    
    # Reparaturdetails
    start_date = Column(DateTime, nullable=False)                # Beginn der Reparatur
    end_date = Column(DateTime, nullable=False)                  # Ende der Reparatur
    description = Column(Text, nullable=False)                   # Beschreibung der Reparatur
    location = Column(String(255), nullable=False)               # Ort der Reparatur (Werkstatt)
    duration = Column(Integer, nullable=False)                   # Dauer in Tagen
    
    # Kosten
    total_cost = Column(Float, nullable=False, default=0.0)      # Gesamtkosten
    company_paid_amount = Column(Float, nullable=False, default=0.0)  # Vom Unternehmen gezahlt
    
    # Ursache
    cause_type = Column(String(20), nullable=False)              # Verschleiß oder Unfall
    caused_by_employee_id = Column(String(36), ForeignKey("employees.employee_id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Beziehungen
    vehicle = relationship("Vehicle", back_populates="repairs")

# Termin-Tabelle (für geplante Wartungen, Inspektionen etc.)
class Appointment(Base):
    __tablename__ = "appointments"
    
    # Primärschlüssel
    appointment_id = Column(String(36), primary_key=True, default=generate_uuid)
    
    # Beziehung zum Fahrzeug
    vehicle_id = Column(String(36), ForeignKey("vehicles.vehicle_id"), nullable=False)
    
    # Termindetails
    appointment_date = Column(DateTime, nullable=False)          # Datum des Termins
    time = Column(String(10), nullable=False)                    # Uhrzeit im Format "HH:MM"
    description = Column(Text, nullable=False)                   # Beschreibung des Termins
    location = Column(String(255), nullable=False)               # Ort des Termins
    appointment_type = Column(String(50), nullable=False)        # Art des Termins
    completed = Column(Boolean, default=False)                   # Abgeschlossen?
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Beziehungen
    vehicle = relationship("Vehicle", back_populates="appointments")

# Fahrzeugzuweisung-Tabelle (welcher Mitarbeiter hat welches Fahrzeug an welchem Tag)
class VehicleAssignment(Base):
    __tablename__ = "vehicle_assignments"
    
    # Primärschlüssel
    assignment_id = Column(String(36), primary_key=True, default=generate_uuid)
    
    # Beziehungen
    vehicle_id = Column(String(36), ForeignKey("vehicles.vehicle_id"), nullable=False)
    employee_id = Column(String(36), ForeignKey("employees.employee_id"), nullable=False)
    
    # Zuweisungsdetails
    assignment_date = Column(DateTime, nullable=False)           # Datum der Zuweisung
    assigned_by = Column(String(255), nullable=False)            # Wer hat zugewiesen
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Beziehungen
    # vehicle = relationship("Vehicle", back_populates="assignments")
    # employee = relationship("Employee", back_populates="vehicle_assignments")

# FileUpload-Tabelle für hochgeladene Dateien
class FileUpload(Base):
    __tablename__ = "file_uploads"
    
    # Primärschlüssel
    id = Column(Integer, primary_key=True)
    
    # Datei-Informationen
    file_id = Column(String(36), unique=True, nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False)  # z.B. "scorecard", "customerContact"
    upload_date = Column(DateTime, default=datetime.now)
    
    # Verarbeitungs-Informationen
    processing_id = Column(String(36), nullable=False)
    processing_status = Column(String(50), default="queued")  # queued, processing, completed, failed
    processing_progress = Column(Integer, default=0)  # 0-100%
    processing_message = Column(String(255), nullable=True)
    result_url = Column(String(512), nullable=True)
    result_data = Column(Text, nullable=True)  # JSON-String der Ergebnisse
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

# Scorecard-Tabelle
class Scorecard(Base):
    __tablename__ = "scorecards"
    
    # Primärschlüssel
    id = Column(Integer, primary_key=True)
    
    # Referenz zur Datei
    file_id = Column(String(36), ForeignKey("file_uploads.file_id"))
    
    # Metadaten
    week = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    location = Column(String(10), nullable=False)
    overall_score = Column(Float, nullable=False)
    overall_status = Column(String(20), nullable=False)
    rank = Column(Integer, nullable=True)
    rank_note = Column(String(255), nullable=True)
    is_sample_data = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Beziehungen
    company_kpis = relationship("CompanyKPI", back_populates="scorecard", cascade="all, delete-orphan")
    driver_kpis = relationship("DriverKPI", back_populates="scorecard", cascade="all, delete-orphan")

# CompanyKPI-Tabelle
class CompanyKPI(Base):
    __tablename__ = "company_kpis"
    
    # Primärschlüssel
    id = Column(Integer, primary_key=True)
    
    # Referenz zur Scorecard
    scorecard_id = Column(Integer, ForeignKey("scorecards.id"), nullable=False)
    
    # KPI-Informationen
    name = Column(String(255), nullable=False)
    value = Column(Float, nullable=False)
    target = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)  # success, warning, danger
    category = Column(String(50), nullable=False)  # safety, compliance, customer, standardWork, quality, capacity
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    
    # Beziehung
    scorecard = relationship("Scorecard", back_populates="company_kpis")

# DriverKPI-Tabelle
class DriverKPI(Base):
    __tablename__ = "driver_kpis"
    
    # Primärschlüssel
    id = Column(Integer, primary_key=True)
    
    # Referenz zur Scorecard
    scorecard_id = Column(Integer, ForeignKey("scorecards.id"), nullable=False)
    
    # Driver-Informationen
    driver_id = Column(String(20), nullable=False)
    name = Column(String(255), nullable=False)
    metrics = Column(Text, nullable=False)  # JSON-String mit Metriken
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    
    # Beziehung
    scorecard = relationship("Scorecard", back_populates="driver_kpis")
