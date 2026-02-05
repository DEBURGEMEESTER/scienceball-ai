from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Channel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str  # "INTERNAL" or "DIRECTOR_NETWORK"

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    channel_id: int = Field(foreign_key="channel.id")
    sender: str
    content: str
    player_id: Optional[str] = None  # Optional player attachment
    timestamp: datetime = Field(default_factory=datetime.now)
