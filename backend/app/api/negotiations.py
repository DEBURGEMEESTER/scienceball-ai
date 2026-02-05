from fastapi import APIRouter, HTTPException
from typing import List, Optional
from sqlmodel import Session, select
from app.models.negotiation import Negotiation, Agent
from app.models.player import Player
from app.core.db import engine
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/negotiations", tags=["negotiations"])

class NegotiationCreate(BaseModel):
    player_id: str
    estimated_fee: float = 0.0
    notes: Optional[str] = None

class NegotiationUpdate(BaseModel):
    status: Optional[str] = None
    estimated_fee: Optional[float] = None
    estimated_salary: Optional[float] = None
    contract_years: Optional[int] = None
    notes: Optional[str] = None

@router.get("/", response_model=List[Negotiation])
async def get_negotiations():
    with Session(engine) as session:
        return session.exec(select(Negotiation)).all()

@router.post("/", response_model=Negotiation)
async def create_negotiation(neg: NegotiationCreate):
    with Session(engine) as session:
        # Check if player exists
        player = session.get(Player, neg.player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
            
        db_neg = Negotiation(
            player_id=neg.player_id,
            estimated_fee=neg.estimated_fee,
            notes=neg.notes,
            last_updated=datetime.now()
        )
        session.add(db_neg)
        session.commit()
        session.refresh(db_neg)
        return db_neg

@router.put("/{neg_id}", response_model=Negotiation)
async def update_negotiation(neg_id: int, update: NegotiationUpdate):
    with Session(engine) as session:
        db_neg = session.get(Negotiation, neg_id)
        if not db_neg:
            raise HTTPException(status_code=404, detail="Negotiation not found")
            
        update_data = update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_neg, key, value)
            
        db_neg.last_updated = datetime.now()
        session.add(db_neg)
        session.commit()
        session.refresh(db_neg)
        return db_neg

@router.get("/summary")
async def get_negotiation_summary():
    with Session(engine) as session:
        negs = session.exec(select(Negotiation)).all()
        total_committed = sum(n.estimated_fee for n in negs if n.status != "FAILED")
        active_deals = len([n for n in negs if n.status not in ["SIGNED", "FAILED"]])
        
        return {
            "total_committed_fees": total_committed,
            "active_negotiations": active_deals,
            "signed_count": len([n for n in negs if n.status == "SIGNED"]),
            "budget_utilization": "Placeholder" # Would compare against a club model later
        }

@router.get("/agents", response_model=List[Agent])
async def get_agents():
    with Session(engine) as session:
        agents = session.exec(select(Agent)).all()
        if not agents:
            # Seed some mock agents
            a1 = Agent(name="Jorge Mendes", agency="Gestifute")
            a2 = Agent(name="Mino Raiola Estate", agency="Team Raiola")
            session.add(a1)
            session.add(a2)
            session.commit()
            return [a1, a2]
        return agents
