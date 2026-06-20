from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Token and Clearance schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    operator_id: str
    role: str

class TokenData(BaseModel):
    operator_id: Optional[str] = None

class LoginRequest(BaseModel):
    operator_id: str
    password: str

class UserCreate(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str = "operator"
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Incident Schemas ---
class IncidentBase(BaseModel):
    type: str
    severity: str
    lat: float
    lng: float
    area: str
    district: str
    description: Optional[str] = None
    evacuation_status: bool = False
    casualties: int = 0
    assigned_teams: List[str] = []

class IncidentCreate(IncidentBase):
    id: str # e.g. "INC-204"

class IncidentUpdate(BaseModel):
    severity: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    evacuation_status: Optional[bool] = None
    casualties: Optional[int] = None
    assigned_teams: Optional[List[str]] = None

class IncidentOut(IncidentBase):
    id: str
    status: str
    reported_at: datetime

    class Config:
        from_attributes = True

# --- Alert Schemas ---
class AlertBase(BaseModel):
    title: str
    type: str
    severity: str
    region: str
    expires_at: datetime
    description: Optional[str] = None
    source: str = "DisasterMind AI"

class AlertCreate(AlertBase):
    id: str

class AlertUpdate(BaseModel):
    severity: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    expires_at: Optional[datetime] = None

class AlertOut(AlertBase):
    id: str
    issued_at: datetime
    status: str

    class Config:
        from_attributes = True

# --- Shelter Schemas ---
class ShelterBase(BaseModel):
    name: str
    lat: float
    lng: float
    address: str
    capacity: int
    occupancy: int = 0
    water_level: str = "Adequate"
    food_level: str = "Adequate"
    medical_level: str = "Adequate"
    beds_level: str = "Adequate"
    power_level: str = "Adequate"
    contact: Optional[str] = None

class ShelterCreate(ShelterBase):
    id: str

class ShelterUpdate(BaseModel):
    occupancy: Optional[int] = None
    status: Optional[str] = None
    water_level: Optional[str] = None
    food_level: Optional[str] = None
    medical_level: Optional[str] = None
    beds_level: Optional[str] = None
    power_level: Optional[str] = None

class ShelterOut(ShelterBase):
    id: str
    status: str

    class Config:
        from_attributes = True

# --- Rescue Team / Resources Schemas ---
class RescueTeamBase(BaseModel):
    name: str
    type: str
    strength: int = 15
    specialization: Optional[str] = None
    current_lat: float
    current_lng: float
    equipment: List[str] = []
    assigned_incidents: List[str] = []

class RescueTeamCreate(RescueTeamBase):
    id: str

class RescueTeamUpdate(BaseModel):
    status: Optional[str] = None
    strength: Optional[int] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    equipment: Optional[List[str]] = None
    assigned_incidents: Optional[List[str]] = None

class RescueTeamOut(RescueTeamBase):
    id: str
    status: str

    class Config:
        from_attributes = True

# --- SOS Request Schemas ---
class SOSRequestBase(BaseModel):
    sender_name: str
    contact: str
    lat: float
    lng: float
    district: str
    message: str
    urgency: str = "High"
    people_count: int = 1
    assigned_team_id: Optional[str] = None

class SOSRequestCreate(SOSRequestBase):
    id: str

class SOSRequestUpdate(BaseModel):
    urgency: Optional[str] = None
    status: Optional[str] = None
    assigned_team_id: Optional[str] = None

class SOSRequestOut(SOSRequestBase):
    id: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Resource Requisition Schemas ---
class ResourceRequisitionBase(BaseModel):
    shelter_id: str
    resource_type: str
    requested_amount: int
    urgency: str

class ResourceRequisitionCreate(ResourceRequisitionBase):
    pass

class ResourceRequisitionOut(ResourceRequisitionBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- System Logs Schemas ---
class SystemLogCreate(BaseModel):
    source: str
    message: str
    type: str = "info"

class SystemLogOut(SystemLogCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
