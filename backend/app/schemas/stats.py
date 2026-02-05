from typing import Optional
from pydantic import BaseModel

class AdvancedStats(BaseModel):
    # Attacking
    xg_per_90: float
    xa_per_90: float
    shots_on_target_pct: float
    goal_conversion_pct: float
    
    # Possession / Passing
    progressive_passes_per_90: float
    pass_completion_pressure_pct: float
    progressive_carries_per_90: float
    
    # Defending
    ppda: float  # Passes Allowed Per Defensive Action
    defensive_duels_won_pct: float
    interceptions_per_90: float
    
    # Physical / Tactical
    distance_covered_per_90: float  # km
    sprints_per_90: int
    top_speed_kmh: float

class PlayerBaseStats(BaseModel):
    pace: int
    shooting: int
    passing: int
    dribbling: int
    defending: int
    physical: int

class DetailedAttribute(BaseModel):
    name: str
    value: int  # 1-20 or 1-99
    category: str # "Technical", "Mental", "Physical"
