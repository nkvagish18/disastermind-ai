from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.routes.auth import get_current_operator

router = APIRouter(prefix="/sos", tags=["Citizen SOS Dispatch Queue"])

@router.get("/", response_model=List[schemas.SOSRequestOut])
def get_all_sos_signals(
    urgency: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    query = db.query(models.SOSRequest)
    if urgency:
        query = query.filter(models.SOSRequest.urgency == urgency)
    if status_filter:
        query = query.filter(models.SOSRequest.status == status_filter)
        
    return query.order_by(models.SOSRequest.timestamp.desc()).all()

@router.post("/", response_model=schemas.SOSRequestOut, status_code=status.HTTP_201_CREATED)
def submit_new_sos_beacon(
    sos_in: schemas.SOSRequestCreate,
    db: Session = Depends(get_db)
    # Note: Broad public route, does not require Operator clearance headers
):
    db_obj = models.SOSRequest(**sos_in.dict())
    db.add(db_obj)
    
    audit = models.SystemLog(
        source="SOS System",
        message=f"CIVILIAN BEACON ACTIVE: High-urgency alert received from {sos_in.sender_name} in district '{sos_in.district}'. Msg: {sos_in.message}",
        type="critical" if sos_in.urgency in ["Critical", "High"] else "warning"
    )
    db.add(audit)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{sos_id}", response_model=schemas.SOSRequestOut)
def allocate_sos_rescue_team(
    sos_id: str,
    update_in: schemas.SOSRequestUpdate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = db.query(models.SOSRequest).filter(models.SOSRequest.id == sos_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="SOS beacon not located")
        
    update_data = update_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    if "assigned_team_id" in update_data and update_data["assigned_team_id"]:
        db_obj.status = "Dispatched"
        team = db.query(models.RescueTeam).filter(models.RescueTeam.id == update_data["assigned_team_id"]).first()
        team_name = team.name if team else update_data["assigned_team_id"]
        
        audit = models.SystemLog(
            source="SOS Queue Ops",
            message=f"SOS ENVELOPE RESOLUTION: Assigned rescue unit '{team_name}' search squad to citizen: '{db_obj.sender_name}'. status changed to DISPATCHED.",
            type="success"
        )
        db.add(audit)
        
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/broadcast", status_code=status.HTTP_200_OK)
def trigger_regional_sms_broadcast(
    district: str,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    # Standard broadcast log mimicking handleMassBroadcast handler
    audit = models.SystemLog(
        source="Warning Ops",
        message=f"SMS EMERGENCY BROADCAST TRANSMITTED: All citizens in '{district}' have received high-priority warning SMS alerts on cell grids.",
        type="critical"
    )
    db.add(audit)
    db.commit()
    return {"message": "Emergency cellular warning broadcast enqueued successfully.", "nodes": 124, "region": district}
