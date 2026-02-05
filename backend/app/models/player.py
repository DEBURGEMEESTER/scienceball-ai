from typing import List, Optional, Dict
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
import uuid

# Association table for Many-to-Many relationship between Players and Shortlists
class ShortlistPlayerLink(SQLModel, table=True):
    shortlist_id: Optional[int] = Field(default=None, foreign_key="shortlist.id", primary_key=True)
    player_id: Optional[str] = Field(default=None, foreign_key="player.id", primary_key=True)

class Player(SQLModel, table=True):
    id: str = Field(primary_key=True)
    fm_id: Optional[int] = Field(default=None, index=True) # Professional DB ID
    name: str = Field(index=True)
    club: str = Field(index=True)
    league: str = Field(index=True)
    position: str
    age: int
    nationality: str
    image: str
    market_value: str
    predicted_growth: float
    tactical_role: Optional[str] = "Balanced"
    contract_expiry: Optional[str] = "2027-06-30"  # Default for analytics
    market_surge: Optional[float] = 0.0
    
    # Store complex JSON structures
    metrics: List[Dict] = Field(default=[], sa_column=Column(JSON))
    attributes: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    medical_dna: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    physical_metrics: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    cognitive_profile: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    biometric_profile: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    
    # Phase 41: Enrichment
    agent_info: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    value_history: Optional[List[Dict]] = Field(default=[], sa_column=Column(JSON))
    
    scientific_dossier: Optional[str] = None
    is_synthetic: bool = Field(default=False)
    
    # Explicit Stats Columns for querying/sorting
    pace: int = Field(default=0)
    shooting: int = Field(default=0)
    passing: int = Field(default=0)
    dribbling: int = Field(default=0)
    defending: int = Field(default=0)
    physical: int = Field(default=0)
    
    xg_per_90: float = Field(default=0.0)
    xa_per_90: float = Field(default=0.0)
    ppda: float = Field(default=0.0)

    
    # Relationships
    notes: List["ScoutNote"] = Relationship(back_populates="player")
    shortlists: List["Shortlist"] = Relationship(back_populates="players", link_model=ShortlistPlayerLink)

class Shortlist(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    
    # Relationships
    players: List[Player] = Relationship(back_populates="shortlists", link_model=ShortlistPlayerLink)

class ScoutNote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: str = Field(foreign_key="player.id")
    scout: str
    note: str
    date: str
    
    # Relationships
    player: Player = Relationship(back_populates="notes")

class SavedSearch(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    criteria: Dict = Field(default={}, sa_column=Column(JSON))
    date: str
