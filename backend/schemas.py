
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Basis-Modell mit gemeinsamen Feldern
class BaseResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime

# Employee-Modelle
class EmployeeBase(BaseModel):
    name: str
    email: str
    phone: str
    status: str = "Aktiv"
    transporter_id: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    address: Optional[str] = None
    telegram_username: Optional[str] = None
    working_days_a_week: int = 5
    preferred_vehicle: Optional[str] = None
    preferred_working_days: Optional[str] = None
    wants_to_work_six_days: bool = False
    is_working_days_flexible: bool = True
    mentor_first_name: Optional[str] = None
    mentor_last_name: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase, BaseResponse):
    class Config:
        orm_mode = True

# Driver KPI-Modelle
class DriverMetric(BaseModel):
    name: str
    value: Any
    target: Any
    status: str

class DriverKPIBase(BaseModel):
    name: str
    metrics: List[DriverMetric]
    status: str = "active"

class DriverKPICreate(DriverKPIBase):
    driver_id: str

class DriverKPIResponse(DriverKPIBase):
    driver_id: str
    
    class Config:
        orm_mode = True

# Company KPI-Modelle
class CompanyKPIBase(BaseModel):
    name: str
    value: float
    target: float
    status: str
    category: str

class CompanyKPICreate(CompanyKPIBase):
    pass

class CompanyKPIResponse(CompanyKPIBase):
    id: int
    
    class Config:
        orm_mode = True

# Scorecard-Modelle
class ScorecardBase(BaseModel):
    week: int
    year: int
    location: str
    overall_score: float
    overall_status: str
    rank: Optional[int] = None
    rank_note: Optional[str] = None

class ScorecardCreate(ScorecardBase):
    is_sample_data: bool = False
    company_kpis: List[CompanyKPICreate] = []
    driver_kpis: List[DriverKPICreate] = []

class ScorecardResponse(ScorecardBase):
    id: int
    file_id: str
    is_sample_data: bool
    created_at: datetime
    company_kpis: List[CompanyKPIResponse] = []
    driver_kpis: List[DriverKPIResponse] = []
    
    class Config:
        orm_mode = True

# Verarbeitungs-Status-Modelle
class ProcessingStatus(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Datei-Upload-Modelle
class FileUploadBase(BaseModel):
    fileId: str
    filename: str
    processingStatus: str
    processingId: str

class FileUploadResponse(BaseModel):
    success: bool
    data: Optional[FileUploadBase] = None
    error: Optional[str] = None

# Extraktions-Ergebnis-Modell
class ExtractionResult(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
