from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select, delete
from app.models.staff import Assignment
from app.models.chat import Message
from app.core.db import engine
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin/archive", tags=["admin"])

@router.post("/execute")
async def execute_archiving():
    """
    Move completed assignments and old messages to 'Archived' status or handle seasonal cleanup.
    """
    with Session(engine) as session:
        # Archive completed assignments older than 30 days
        cutoff = datetime.now() - timedelta(days=30)
        
        assignments = session.exec(
            select(Assignment).where(Assignment.status == "COMPLETED").where(Assignment.created_at < cutoff)
        ).all()
        
        count = 0
        for a in assignments:
            a.status = "ARCHIVED"
            count += 1
        
        session.commit()
        return {"archived_assignments": count, "timestamp": datetime.now()}
