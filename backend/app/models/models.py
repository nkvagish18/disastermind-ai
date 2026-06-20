from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import datetime as dt
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # e.g. "DM-ADM-2041"
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="operator") # operator, administrator, viewer
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True) # e.g. "INC-204"
    type = Column(String, nullable=False) # Flood, Fire, Cyclone, Earthquake, Cloudburst
    severity = Column(String, nullable=False) # Severe, Extreme, Moderate, Minor
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    area = Column(String, nullable=False)
    district = Column(String, nullable=False)
    status = Column(String, default="Active") # Active, Contained, Resolved, Monitoring
    reported_at = Column(DateTime, default=dt.datetime.utcnow)
    description = Column(String, nullable=True)
    evacuation_status = Column(Boolean, default=False)
    casualties = Column(Integer, default=0)
    assigned_teams = Column(JSON, default=list) # List of team IDs e.g. ["NDRF-Unit-5"]

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True) # e.g. "ALT-105"
    title = Column(String, nullable=False)
    type = Column(String, nullable=False) # Meteorological, Seismic, Hydrological
    severity = Column(String, nullable=False) # Red, Orange, Yellow
    region = Column(String, nullable=False)
    issued_at = Column(DateTime, default=dt.datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    description = Column(String, nullable=True)
    source = Column(String, default="DisasterMind AI")
    status = Column(String, default="Active") # Active, Suppressed, Expired

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(String, primary_key=True, index=True) # e.g. "SHL-402"
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    occupancy = Column(Integer, default=0)
    status = Column(String, default="Active") # Active, Full, Ready
    water_level = Column(String, default="Adequate") # Adequate, Critical, Low
    food_level = Column(String, default="Adequate") # Adequate, Critical, Low
    medical_level = Column(String, default="Adequate") # Adequate, Critical, Low
    beds_level = Column(String, default="Adequate") # Adequate, Critical, Low
    power_level = Column(String, default="Adequate") # Adequate, Critical, Low
    contact = Column(String, nullable=True)

class RescueTeam(Base):
    __tablename__ = "rescue_teams"

    id = Column(String, primary_key=True, index=True) # e.g. "NDRF-Unit-5"
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # NDRF Search & Rescue, Medical Dispatch, Coast Guard Air
    status = Column(String, default="Standby") # Standby, Dispatched, Off-Duty
    strength = Column(Integer, default=15)
    specialization = Column(String, nullable=True)
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    equipment = Column(JSON, default=list) # List of equipment strings
    assigned_incidents = Column(JSON, default=list) # incident IDs assigned

class SOSRequest(Base):
    __tablename__ = "sos_requests"

    id = Column(String, primary_key=True, index=True) # e.g. "SOS-9421"
    sender_name = Column(String, nullable=False)
    contact = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    district = Column(String, nullable=False)
    message = Column(String, nullable=False)
    urgency = Column(String, default="High") # Critical, High, Medium, Low
    status = Column(String, default="Unassigned") # Unassigned, Allocating, Dispatched, Resolved
    timestamp = Column(DateTime, default=dt.datetime.utcnow)
    people_count = Column(Integer, default=1)
    assigned_team_id = Column(String, ForeignKey("rescue_teams.id", ondelete="SET NULL"), nullable=True)

    team = relationship("RescueTeam")

class ResourceRequisition(Base):
    __tablename__ = "resource_requisitions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    shelter_id = Column(String, ForeignKey("shelters.id", ondelete="CASCADE"), nullable=False)
    resource_type = Column(String, nullable=False) # Water, MRE, FirstAid, Blanket, GenFuel
    requested_amount = Column(Integer, nullable=False)
    urgency = Column(String, nullable=False) # High, Medium, Low
    status = Column(String, default="Pending") # Pending, Dispatched, Delivered
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    shelter = relationship("Shelter")

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String, nullable=False) # Security System, Dispatcher, Navigator
    message = Column(String, nullable=False)
    type = Column(String, default="info") # info, success, warning, critical
    timestamp = Column(DateTime, default=dt.datetime.utcnow)
