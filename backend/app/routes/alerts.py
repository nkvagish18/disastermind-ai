from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime as dt
from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.routes.auth import get_current_operator

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts and Signals"])

@router.get("/", response_model=List[schemas.AlertOut])
def get_active_alerts(
    severity: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    query = db.query(models.Alert)
    if severity:
        query = query.filter(models.Alert.severity == severity)
    if region:
        query = query.filter(models.Alert.region.ilike(f"%{region}%"))
        
    return query.order_by(models.Alert.issued_at.desc()).all()

@router.post("/", response_model=schemas.AlertOut, status_code=status.HTTP_201_CREATED)
def issue_alert(
    alert_in: schemas.AlertCreate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    existing = db.query(models.Alert).filter(models.Alert.id == alert_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Alert code already in use")
        
    db_obj = models.Alert(**alert_in.dict())
    db.add(db_obj)
    
    # Trigger system audit log for dispatcher broadcasts
    audit = models.SystemLog(
        source="Alert Master",
        message=f"BROADCAST ISSUED: {alert_in.title} [{alert_in.severity} Warning] for region: {alert_in.region}.",
        type="critical" if alert_in.severity == "Red" else "warning"
    )
    db.add(audit)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{alert_id}", response_model=schemas.AlertOut)
def suppress_of_update_alert(
    alert_id: str,
    update_in: schemas.AlertUpdate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Alert register not found")
        
    update_data = update_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    audit = models.SystemLog(
        source="Alert Master",
        message=f"ALERT UPDATE: Ref: {alert_id} fields adjusted by active dispatcher.",
        type="info"
    )
    db.add(audit)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def purge_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Alert register not found")
        
    db.delete(db_obj)
    audit = models.SystemLog(
        source="Alert Master",
        message=f"ALERT EXPUNGED: Broadcast sequence {alert_id} terminated and wiped from databanks.",
        type="info"
    )
    db.add(audit)
    db.commit()
    return None
