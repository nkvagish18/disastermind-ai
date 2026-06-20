from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import create_access_token, get_password_hash, verify_password, oauth2_scheme, verify_token
from backend.app.core.config import settings
from backend.app.models import models
from backend.app.schemas import schemas

router = APIRouter(prefix="/auth", tags=["Clearance & Authentication"])

def get_current_operator(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    operator_id = verify_token(token)
    if operator_id is None:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == operator_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive operator account")
    return user

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register_operator(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_in.id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Operator ID already registered")
    
    db_email = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    db_obj = models.User(
        id=user_in.id,
        name=user_in.name,
        email=user_in.email,
        role=user_in.role,
        hashed_password=hashed_password
    )
    db.add(db_obj)
    
    # Create auto audit trace log
    audit_log = models.SystemLog(
        source="Security System",
        message=f"Operator account {user_in.id} successfully provisioned under role '{user_in.role}'.",
        type="info"
    )
    db.add(audit_log)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Retrieve user by operator code/username
    user = db.query(models.User).filter(models.User.id == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Create failed login audit record
        failed_log = models.SystemLog(
            source="Security System",
            message=f"FAILED clearance ingress attempt detected for user: {form_data.username}",
            type="critical"
        )
        db.add(failed_log)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect operator ID or tactical key activation pass",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=user.id, expires_delta=access_token_expires)
    
    # Create successful login audit record
    success_log = models.SystemLog(
        source="Security System",
        message=f"Operator {user.id} established credentials. Gateway clearance unlocked.",
        type="success"
    )
    db.add(success_log)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "operator_id": user.id,
        "role": user.role
    }

@router.get("/me", response_model=schemas.UserOut)
def read_current_operator(current_operator: models.User = Depends(get_current_operator)):
    return current_operator
