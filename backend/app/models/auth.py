from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timedelta

class Club(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    access_key: str  # The shared password for the club
    primary_color: str = Field(default="#00f2ff")
    secondary_color: str = Field(default="#7000ff")
    accent_color: str = Field(default="#ff007a")
    is_admin: bool = Field(default=False)
    
    users: List["User"] = Relationship(back_populates="club")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    club_id: int = Field(foreign_key="club.id")
    first_login_at: Optional[datetime] = None
    
    club: Club = Relationship(back_populates="users")

    @property
    def trial_expires_at(self) -> Optional[datetime]:
        if self.first_login_at:
            return self.first_login_at + timedelta(days=7)
        return None
