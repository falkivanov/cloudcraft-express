
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from db import Base

# Modell für hochgeladene Dateien
class FileUpload(Base):
    __tablename__ = "file_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, unique=True, index=True)
    filename = Column(String)
    file_path = Column(String)
    file_type = Column(String)  # scorecard, mentor, concessions, etc.
    upload_date = Column(DateTime, default=datetime.now)
    processing_id = Column(String, index=True)
    processing_status = Column(String)  # queued, processing, completed, failed
    processing_progress = Column(Integer, default=0)
    processing_message = Column(String, nullable=True)
    result_url = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    
    # Beziehung zu Scorecard-Daten
    scorecards = relationship("Scorecard", back_populates="file_upload")

# Modell für Scorecard-Daten
class Scorecard(Base):
    __tablename__ = "scorecards"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, ForeignKey("file_uploads.file_id"))
    week = Column(Integer)
    year = Column(Integer)
    location = Column(String)
    overall_score = Column(Float)
    overall_status = Column(String)  # success, warning, error
    rank = Column(Integer)
    rank_note = Column(String, nullable=True)
    recommended_focus_areas = Column(Text, nullable=True)  # JSON-String
    is_sample_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Beziehungen
    file_upload = relationship("FileUpload", back_populates="scorecards")
    company_kpis = relationship("CompanyKPI", back_populates="scorecard")
    driver_kpis = relationship("DriverKPI", back_populates="scorecard")

# Modell für Unternehmens-KPIs
class CompanyKPI(Base):
    __tablename__ = "company_kpis"
    
    id = Column(Integer, primary_key=True, index=True)
    scorecard_id = Column(Integer, ForeignKey("scorecards.id"))
    name = Column(String)
    category = Column(String)  # safety, compliance, customer, etc.
    value = Column(Float)
    target = Column(Float, nullable=True)
    status = Column(String)  # success, warning, error
    trend = Column(String, nullable=True)  # up, down, stable
    description = Column(String, nullable=True)
    
    # Beziehung
    scorecard = relationship("Scorecard", back_populates="company_kpis")

# Modell für Fahrer-KPIs
class DriverKPI(Base):
    __tablename__ = "driver_kpis"
    
    id = Column(Integer, primary_key=True, index=True)
    scorecard_id = Column(Integer, ForeignKey("scorecards.id"))
    driver_id = Column(String, index=True)  # Externe Fahrer-ID
    name = Column(String)
    dsp = Column(String, nullable=True)
    metrics = Column(Text)  # JSON-String mit Metrics
    
    # Beziehung
    scorecard = relationship("Scorecard", back_populates="driver_kpis")
    # Potenzielle Beziehung zu einer Mitarbeiter-Tabelle
    # employee = relationship("Employee", foreign_keys=[driver_id], backref="driver_kpis")

# Modell für Concessions-Daten
class Concession(Base):
    __tablename__ = "concessions"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, ForeignKey("file_uploads.file_id"))
    week = Column(Integer)
    year = Column(Integer)
    station = Column(String)
    driver_id = Column(String, index=True)
    driver_name = Column(String)
    route_code = Column(String, nullable=True)
    amount = Column(Float)
    concession_date = Column(DateTime)
    reason = Column(String)
    category = Column(String)
    status = Column(String, nullable=True)  # open, closed, pending
    
    # Beziehungen können nach Bedarf hinzugefügt werden

# Modell für Mentor-Daten
class MentorReport(Base):
    __tablename__ = "mentor_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, ForeignKey("file_uploads.file_id"))
    week = Column(Integer)
    year = Column(Integer)
    report_date = Column(DateTime)
    station = Column(String)
    
    # Beziehung zu Fahrer-Einträgen
    mentor_drivers = relationship("MentorDriver", back_populates="report")

# Modell für Mentor-Fahrer-Daten
class MentorDriver(Base):
    __tablename__ = "mentor_drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("mentor_reports.id"))
    driver_id = Column(String, index=True)
    driver_name = Column(String)
    station = Column(String)
    trips = Column(Integer)
    hours = Column(Float)
    speeding = Column(Float)
    following_distance = Column(Float)
    distraction = Column(Float)
    seatbelt = Column(Float)
    sign_violations = Column(Float)
    overall_fico_score = Column(Float)
    
    # Beziehung
    report = relationship("MentorReport", back_populates="mentor_drivers")

# Modell für Mitarbeiter (für Mapping von Fahrer-IDs)
class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, nullable=True)
    station = Column(String)
    position = Column(String)
    status = Column(String)  # active, inactive, terminated
    driver_id = Column(String, nullable=True, index=True)  # Verbindung zur Fahrer-ID
    hiring_date = Column(DateTime, nullable=True)
    termination_date = Column(DateTime, nullable=True)
    
    # Beziehungen können nach Bedarf hinzugefügt werden
