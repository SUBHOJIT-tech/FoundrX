from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_startup(name: str, domain: str, founder_id: int, db: Session = Depends(get_db)):
    new_startup = models.Startup(name=name, domain=domain, founder_id=founder_id)
    db.add(new_startup)
    db.commit()
    db.refresh(new_startup)
    return {"status": "success", "startup": {"id": new_startup.id, "name": new_startup.name}}
