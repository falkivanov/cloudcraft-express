from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

# Basis-Schema für API-Antworten
class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None

# Schema für eine FileUpload-Antwort
class FileUploadResponseData(BaseModel):
    fileId: str
    filename: str
    processingStatus: str = "queued"
    processingId: Optional[str] = None

class FileUploadResponse(ApiResponse):
    data: Optional[FileUploadResponseData] = None

# Schema für den Verarbeitungsstatus
class ProcessingStatusData(BaseModel):
    status: str
    progress: Optional[int] = None
    message: Optional[str] = None
    resultUrl: Optional[str] = None
    error: Optional[str] = None

class ProcessingStatus(ApiResponse):
    data: Optional[ProcessingStatusData] = None

# Schema für Extraktionsergebnisse
class ExtractionResult(ApiResponse):
    data: Any = None

# Scorecard-Schemas
class MetricBase(BaseModel):
    name: str
    value: Any
    target: Optional[Any] = None
    status: Optional[str] = None
    trend: Optional[str] = None
    description: Optional[str] = None

class CompanyKPIBase(MetricBase):
    category: str

class CompanyKPICreate(CompanyKPIBase):
    pass

class CompanyKPIResponse(CompanyKPIBase):
    id: int
    scorecard_id: int

    class Config:
        orm_mode = True

class DriverKPIBase(BaseModel):
    driver_id: str
    name: str
    dsp: Optional[str] = None
    metrics: List[MetricBase]

class DriverKPICreate(DriverKPIBase):
    pass

class DriverKPIResponse(DriverKPIBase):
    id: int
    scorecard_id: int

    class Config:
        orm_mode = True

class ScorecardBase(BaseModel):
    week: int
    year: int
    location: str
    overall_score: float
    overall_status: str
    rank: int
    rank_note: Optional[str] = None
    recommended_focus_areas: Optional[List[str]] = None
    is_sample_data: bool = False

class ScorecardCreate(ScorecardBase):
    file_id: str

class ScorecardResponse(ScorecardBase):
    id: int
    file_id: str
    created_at: datetime
    company_kpis: List[CompanyKPIResponse]
    driver_kpis: List[DriverKPIResponse]

    class Config:
        orm_mode = True

# Concession-Schemas
class ConcessionBase(BaseModel):
    week: int
    year: int
    station: str
    driver_id: str
    driver_name: str
    route_code: Optional[str] = None
    amount: float
    concession_date: datetime
    reason: str
    category: str
    status: Optional[str] = None

class ConcessionCreate(ConcessionBase):
    file_id: str

class ConcessionResponse(ConcessionBase):
    id: int
    file_id: str

    class Config:
        orm_mode = True

# Mentor-Report-Schemas
class MentorDriverBase(BaseModel):
    driver_id: str
    driver_name: str
    station: str
    trips: int
    hours: float
    speeding: float
    following_distance: float
    distraction: float
    seatbelt: float
    sign_violations: float
    overall_fico_score: float

class MentorDriverCreate(MentorDriverBase):
    report_id: int

class MentorDriverResponse(MentorDriverBase):
    id: int
    report_id: int

    class Config:
        orm_mode = True

class MentorReportBase(BaseModel):
    week: int
    year: int
    report_date: datetime
    station: str

class MentorReportCreate(MentorReportBase):
    file_id: str

class MentorReportResponse(MentorReportBase):
    id: int
    file_id: str
    mentor_drivers: List[MentorDriverResponse]

    class Config:
        orm_mode = True

# Employee-Schema
class EmployeeBase(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    station: str
    position: str
    status: str
    driver_id: Optional[str] = None
    hiring_date: Optional[datetime] = None
    termination_date: Optional[datetime] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int

    class Config:
        orm_mode = True

# Employee-Schemas - aktualisiert für die Frontend-Kompatibilität
class EmployeeBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str
    transporter_id: Optional[str] = None  # Equivalent zu transporterId im Frontend
    start_date: datetime
    end_date: Optional[datetime] = None
    address: Optional[str] = None
    telegram_username: Optional[str] = None
    working_days_a_week: int = 5
    preferred_vehicle: Optional[str] = None
    preferred_working_days: Optional[List[str]] = []
    wants_to_work_six_days: bool = False
    is_working_days_flexible: bool = True
    mentor_first_name: Optional[str] = None
    mentor_last_name: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    employee_id: str  # Wird vom Frontend generiert (UUID)

class EmployeeUpdate(EmployeeBase):
    pass

class EmployeeInDB(EmployeeBase):
    id: int
    employee_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class EmployeeResponse(EmployeeBase):
    id: str  # Wir verwenden employee_id für die Frontend-Kompatibilität
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Für Batch-Operationen
class EmployeeBatchCreate(BaseModel):
    employees: List[EmployeeCreate]

class EmployeeBatchResponse(BaseModel):
    employees: List[EmployeeResponse]
    count: int
    success: bool
    message: Optional[str] = None
