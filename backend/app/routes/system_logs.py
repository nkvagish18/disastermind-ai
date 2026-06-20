from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.routes.auth import get_current_operator

router = APIRouter(prefix="/system-logs", tags=["Command Audit & Live Telemetry Logs"])

@router.get("/", response_model=List[schemas.SystemLogOut])
def search_system_logs(
    limit: int = 50,
    source: Optional[str] = None,
    log_type: Optional[str] = None,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    query = db.query(models.SystemLog)
    if source:
        query = query.filter(models.SystemLog.source == source)
    if log_type:
        query = query.filter(models.SystemLog.type == log_type)
        
    return query.order_by(models.SystemLog.timestamp.desc()).limit(limit).all()

@router.post("/", response_model=schemas.SystemLogOut, status_code=status.HTTP_201_CREATED)
def write_system_audit_log(
    log_in: schemas.SystemLogCreate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = models.SystemLog(**log_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/flush", status_code=status.HTTP_244_NO_CONTENT or status.HTTP_204_NO_CONTENT)
def flush_systems_logs_database(
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    # Ensure current user is Administrator
    if clearance.role != "administrator" and clearance.id != "DM-ADM-2041":
        raise HTTPException(status_code=403, detail="Operator requires Administrator level clearances to flush core databases.")
        
    # Standard reset as called by SettingsView
    db.query(models.SystemLog).delete()
    
    # Commit a fresh single trace identifying the flush event
    fresh_trace = models.SystemLog(
        source="Command Hub",
        message="SYSTEM OVERRIDE COMMAND: Clean database synchronisation invoked. Resetting sensors parameter caches.",
        type="critical"
    )
    db.add(fresh_trace)
    db.commit()
    return None
