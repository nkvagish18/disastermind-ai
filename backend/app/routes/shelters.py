from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.routes.auth import get_current_operator

router = APIRouter(prefix="/shelters", tags=["Evacuation Shelters Hub"])

@router.get("/", response_model=List[schemas.ShelterOut])
def list_shelters(
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    return db.query(models.Shelter).order_by(models.Shelter.occupancy.desc()).all()

@router.post("/", response_model=schemas.ShelterOut, status_code=status.HTTP_201_CREATED)
def add_shelter(
    shelter_in: schemas.ShelterCreate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    existing = db.query(models.Shelter).filter(models.Shelter.id == shelter_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Shelter ID is already in use")
        
    db_obj = models.Shelter(**shelter_in.dict())
    db.add(db_obj)
    
    audit = models.SystemLog(
        source="Shelter Hub",
        message=f"NEW EVACUATION CENTRE: Registered '{shelter_in.name}' (Cap: {shelter_in.capacity}) at GPS coordinates.",
        type="success"
    )
    db.add(audit)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{shelter_id}", response_model=schemas.ShelterOut)
def patch_shelter_levels(
    shelter_id: str,
    update_in: schemas.ShelterUpdate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    db_obj = db.query(models.Shelter).filter(models.Shelter.id == shelter_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Shelter records not found")
        
    update_data = update_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    audit = models.SystemLog(
        source="Shelter Hub",
        message=f"SHELTER UPDATE: Adjusted capacities/provisions levels on evacuation point: '{db_obj.name}'.",
        type="info"
    )
    db.add(audit)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/{shelter_id}/requisition", response_model=schemas.ResourceRequisitionOut, status_code=status.HTTP_201_CREATED)
def submit_requisition_dispatch(
    shelter_id: str,
    req_in: schemas.ResourceRequisitionCreate,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    shelter = db.query(models.Shelter).filter(models.Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Evacuation shelter target not found")
        
    db_obj = models.ResourceRequisition(
        shelter_id=shelter_id,
        resource_type=req_in.resource_type,
        requested_amount=req_in.requested_amount,
        urgency=req_in.urgency
    )
    db.add(db_obj)
    
    # Audit log creation mimicking 'onRequisitionResources'
    audit = models.SystemLog(
        source="Shelters Management",
        message=f"ALLOCATION QUEUED: Dispatched {req_in.requested_amount} units of emergency {req_in.resource_type} to '{shelter.name}' instantly.",
        type="info"
    )
    db.add(audit)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/{shelter_id}/requisitions", response_model=List[schemas.ResourceRequisitionOut])
def get_shelter_requisitions(
    shelter_id: str,
    db: Session = Depends(get_db),
    clearance: models.User = Depends(get_current_operator)
):
    return db.query(models.ResourceRequisition).filter(models.ResourceRequisition.shelter_id == shelter_id).all()
