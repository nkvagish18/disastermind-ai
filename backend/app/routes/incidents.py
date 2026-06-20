from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.routes.auth import get_current_operator

router = APIRouter(prefix="/incidents", tags=["Incidents Engine"])

@router.get("/", response_model=List[schemas.IncidentOut])
def list_incidents(
    district: Optional[str] = None,
    severity: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    query = db.query(models.Incident)
    if district:
        query = query.filter(models.Incident.district.ilike(f"%{district}%"))
    if severity:
        query = query.filter(models.Incident.severity == severity)
    if status_filter:
        query = query.filter(models.Incident.status == status_filter)
    
    return query.order_by(models.Incident.reported_at.desc()).all()

@router.post("/", response_model=schemas.IncidentOut, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: schemas.IncidentCreate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_in.id).first()
    if db_incident:
        raise HTTPException(status_code=400, detail="Incident with this ID already registered")
        
    db_obj = models.Incident(**incident_in.dict())
    db.add(db_obj)
    
    # Audit trail creation
    log_obj = models.SystemLog(
        source="Incident Center",
        message=f"NEW INCIDENT SUBMITTED: {incident_in.id} ({incident_in.type}) in {incident_in.area}. Level: {incident_in.severity}.",
        type="warning" if incident_in.severity in ["Moderate", "Minor"] else "critical"
    )
    db.add(log_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/{incident_id}", response_model=schemas.IncidentOut)
def read_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Incident node not found")
    return db_obj

@router.put("/{incident_id}", response_model=schemas.IncidentOut)
def update_incident(
    incident_id: str,
    update_in: schemas.IncidentUpdate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Incident node not found")
        
    update_data = update_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    # Standard security system audit logging
    log_msg = f"INCIDENT {incident_id} MODIFIED: "
    if "status" in update_data:
        log_msg += f"Status altered to '{update_data['status']}'. "
    if "severity" in update_data:
        log_msg += f"Risk level altered to '{update_data['severity']}'. "
        
    log_obj = models.SystemLog(
        source="Incident Center",
        message=log_msg,
        type="info"
    )
    db.add(log_obj)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/{incident_id}", status_code=status.HTTP_244_NO_CONTENT or status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Incident node not found")
    
    db.delete(db_obj)
    log_obj = models.SystemLog(
        source="Security System",
        message=f"INCIDENT DELETED: Ref: {incident_id} database node expunged by active operator.",
        type="warning"
    )
    db.add(log_obj)
    db.commit()
    return None
