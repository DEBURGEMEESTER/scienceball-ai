from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class Agent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    agency: str
    contact_info: Optional[str] = None
    
    negotiations: List["Negotiation"] = Relationship(back_populates="agent")

class Negotiation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: str = Field(foreign_key="player.id", index=True)
    agent_id: Optional[int] = Field(default=None, foreign_key="agent.id", index=True)
    
    # Status: DISCOVERY, INQUIRY, VERBAL, MEDICAL, SIGNED, FAILED
    status: str = Field(default="INQUIRY", index=True)
    estimated_fee: float = Field(default=0.0)
    estimated_salary: float = Field(default=0.0)
    contract_years: int = Field(default=0)
    
    notes: Optional[str] = None
    last_updated: datetime = Field(default_factory=datetime.now)

    agent: Optional[Agent] = Relationship(back_populates="negotiations")
