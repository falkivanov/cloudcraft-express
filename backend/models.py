
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
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Beziehung
    # employee = relationship("Employee", back_populates="shifts")
