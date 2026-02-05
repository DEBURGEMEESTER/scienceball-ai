from fastapi import APIRouter, HTTPException
from typing import List, Optional
from sqlmodel import Session, select
from app.models.staff import StaffMember, Assignment
from app.models.player import Player
from app.models.negotiation import Negotiation
from app.models.chat import Message
from app.core.db import engine
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/staff", tags=["staff"])

class AssignmentCreate(BaseModel):
    player_id: str
    staff_id: int
    priority: str = "MEDIUM"
    notes: Optional[str] = None
    deadline: Optional[datetime] = None

@router.get("/", response_model=List[StaffMember])
async def get_staff():
    with Session(engine) as session:
        staff = session.exec(select(StaffMember)).all()
        if not staff:
            # Seed default technical department
            s1 = StaffMember(name="Erik ten Hag", role="DIRECTOR", specialization="System Tactics")
            s2 = StaffMember(name="Piet de Visser", role="CHIEF_SCOUT", specialization="South American Talent")
            s3 = StaffMember(name="Lead Analyst", role="ANALYST", specialization="Expected Threat Models")
            session.add(s1)
            session.add(s2)
            session.add(s3)
            session.commit()
            return [s1, s2, s3]
        return staff

@router.post("/assignments", response_model=Assignment)
async def create_assignment(req: AssignmentCreate):
    with Session(engine) as session:
        db_assign = Assignment(
            player_id=req.player_id,
            staff_id=req.staff_id,
            priority=req.priority,
            notes=req.notes,
            deadline=req.deadline,
            created_at=datetime.now()
        )
        session.add(db_assign)
        session.commit()
        session.refresh(db_assign)
        return db_assign

@router.get("/feed")
async def get_global_feed():
    with Session(engine) as session:
        # Interweave different event types
        # 1. New Messages (excluding private ones if needed)
        msgs = session.exec(select(Message).order_by(Message.timestamp.desc()).limit(10)).all()
        # 2. Latest Negotiations
        negs = session.exec(select(Negotiation).order_by(Negotiation.last_updated.desc()).limit(10)).all()
        # 3. Latest Assignments
        assigns = session.exec(select(Assignment).order_by(Assignment.created_at.desc()).limit(10)).all()
        
        feed = []
        for m in msgs:
            feed.append({"type": "MESSAGE", "time": m.timestamp, "user": m.sender, "content": m.content, "ref": m.player_id})
        for n in negs:
            feed.append({"type": "NEGOTIATION", "time": n.last_updated, "user": "System", "content": f"Status changed to {n.status}", "ref": n.player_id})
        for a in assigns:
            feed.append({"type": "ASSIGNMENT", "time": a.created_at, "user": "Director", "content": f"New deep-dive assigned to ID {a.staff_id}", "ref": a.player_id})
            
        feed.sort(key=lambda x: x["time"], reverse=True)
        return feed[:20]
