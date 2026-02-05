from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class StaffMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    role: str  # "DIRECTOR", "CHIEF_SCOUT", "SCOUT", "ANALYST"
    avatar: Optional[str] = None
    specialization: Optional[str] = None
    
    assignments: List["Assignment"] = Relationship(back_populates="staff")

class Assignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: str = Field(foreign_key="player.id")
    staff_id: int = Field(foreign_key="staffmember.id")
    
    # Status: PENDING, IN_PROGRESS, COMPLETED, ARCHIVED
    status: str = Field(default="PENDING")
    priority: str = Field(default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    notes: Optional[str] = None
    deadline: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)

    staff: StaffMember = Relationship(back_populates="assignments")
