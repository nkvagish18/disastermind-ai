from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.routes.auth import get_current_operator

router = APIRouter(prefix="/rescue-teams", tags=["Tactical Forces & Rescue Units"])

@router.get("/", response_model=List[schemas.RescueTeamOut])
def get_rescue_teams(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    query = db.query(models.RescueTeam)
    if status_filter:
        query = query.filter(models.RescueTeam.status == status_filter)
    return query.order_by(models.RescueTeam.id.asc()).all()

@router.post("/", response_model=schemas.RescueTeamOut, status_code=status.HTTP_201_CREATED)
def deploy_new_team(
    team_in: schemas.RescueTeamCreate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    existing = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tactical code prefix already active in operational files")
        
    db_obj = models.RescueTeam(**team_in.dict())
    db.add(db_obj)
    
    # Audit logging matching onAddRescueTeam
    audit = models.SystemLog(
        source="Roster Hub",
        message=f"NEW UNIT DEPLOYED: deployed '{team_in.name}' to tactical grid (Location: [{team_in.current_lat}, {team_in.current_lng}]). Strength: {team_in.strength}.",
        type="success"
    )
    db.add(audit)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{team_id}", response_model=schemas.RescueTeamOut)
def patch_team_telemetry(
    team_id: str,
    update_in: schemas.RescueTeamUpdate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Tactical force records empty for team prefix")
        
    update_data = update_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    # Standard warning system updates tracking
    log_msg = f"TEAM TELEMETRY {team_id} ALTERED: "
    if "status" in update_data:
        log_msg += f"Unit status changed to {update_data['status']}. "
    if "current_lat" in update_data:
        log_msg += f"GPS positioning reassigned to coordinates. "
        
    audit = models.SystemLog(
        source="Roster Hub",
        message=log_msg,
        type="info"
    )
    db.add(audit)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/{team_id}", response_model=schemas.RescueTeamOut)
def retrieve_team_logs(
    team_id: str,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Tactical team not registered")
    return db_obj
