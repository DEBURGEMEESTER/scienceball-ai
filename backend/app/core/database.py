from typing import List, Optional, Dict
from pydantic import BaseModel

class PlayerMetric(BaseModel):
    label: str
    value: int # 1-99

class Player(BaseModel):
    id: str
    name: str
    club: str
    league: str
    position: str
    age: int
    nationality: str
    image: str
    metrics: List[PlayerMetric]
    attributes: Optional[dict] = None
    market_value: str
    predicted_growth: float
    tactical_role: Optional[str] = "Balanced"
    contract_expiry: Optional[str] = "2027-06-30"

# Scientific Calibration: League Strength Indices
LEAGUE_STRENGTH = {
    "Premier League": 1.0,
    "La Liga": 0.95,
    "Bundesliga": 0.92,
    "Serie A": 0.90,
    "Ligue 1": 0.85,
    "Eredivisie": 0.78,
    "Brasileirão": 0.75,
    "Argentine Primera": 0.72
}

# 100% Professional Dataset: Elite Prospects & Current Stars
PLAYERS_DB = [
    {
        "id": "lamine-yamal",
        "name": "Lamine Yamal",
        "club": "FC Barcelona",
        "league": "La Liga",
        "position": "RW",
        "age": 17,
        "nationality": "Spain",
        "market_value": "€150M",
        "predicted_growth": 12.5,
        "tactical_role": "Inside Forward",
        "contract_expiry": "2026-06-30",
        "metrics": [
            {"label": "Dribbling", "value": 98},
            {"label": "Vision", "value": 94},
            {"label": "Packing", "value": 92},
            {"label": "xT", "value": 95}
        ],
        "attributes": {
            "technical": [{"name": "Dribbling", "value": 19}, {"name": "Passing", "value": 17}, {"name": "Technique", "value": 18}, {"name": "Crossing", "value": 15}],
            "mental": [{"name": "Flair", "value": 18}, {"name": "Vision", "value": 17}, {"name": "Composure", "value": 16}, {"name": "Decisions", "value": 15}],
            "physical": [{"name": "Acceleration", "value": 17}, {"name": "Agility", "value": 18}, {"name": "Balance", "value": 16}, {"name": "Pace", "value": 16}]
        }
    },
    {
        "id": "arda-guler",
        "name": "Arda Güler",
        "club": "Real Madrid",
        "league": "La Liga",
        "position": "CAM",
        "age": 19,
        "nationality": "Turkey",
        "market_value": "€45M",
        "predicted_growth": 18.0,
        "tactical_role": "Advanced Playmaker",
        "contract_expiry": "2029-06-30",
        "metrics": [
            {"label": "Vision", "value": 96},
            {"label": "Passing", "value": 94},
            {"label": "Set Pieces", "value": 92}
        ],
        "attributes": {
            "technical": [{"name": "Passing", "value": 18}, {"name": "Technique", "value": 19}, {"name": "First Touch", "value": 18}],
            "mental": [{"name": "Vision", "value": 18}, {"name": "Flair", "value": 17}, {"name": "Decisions", "value": 16}],
            "physical": [{"name": "Agility", "value": 16}, {"name": "Balance", "value": 15}, {"name": "Natural Fitness", "value": 14}]
        }
    },
    {
        "id": "florian-wirtz",
        "name": "Florian Wirtz",
        "club": "Bayer Leverkusen",
        "league": "Bundesliga",
        "position": "CAM",
        "age": 21,
        "nationality": "Germany",
        "market_value": "€110M",
        "predicted_growth": 8.0,
        "tactical_role": "Creative Engine",
        "contract_expiry": "2027-06-30",
        "metrics": [
            {"label": "xT", "value": 98},
            {"label": "OBV", "value": 96},
            {"label": "Intelligence", "value": 99}
        ],
        "attributes": {
            "technical": [{"name": "Passing", "value": 18}, {"name": "First Touch", "value": 19}, {"name": "Dribbling", "value": 17}],
            "mental": [{"name": "Vision", "value": 19}, {"name": "Decisions", "value": 18}, {"name": "Anticipation", "value": 17}],
            "physical": [{"name": "Agility", "value": 17}, {"name": "Balance", "value": 16}, {"name": "Stamina", "value": 15}]
        }
    },
    {
        "id": "jamal-musiala",
        "name": "Jamal Musiala",
        "club": "FC Bayern",
        "league": "Bundesliga",
        "position": "CAM/LW",
        "age": 21,
        "nationality": "Germany",
        "market_value": "€120M",
        "predicted_growth": 10.5,
        "tactical_role": "Roaming Playmaker",
        "contract_expiry": "2026-06-30",
        "metrics": [
            {"label": "Dribbling", "value": 99},
            {"label": "Intelligence", "value": 98},
            {"label": "Finish", "value": 85}
        ],
        "attributes": {
            "technical": [{"name": "Dribbling", "value": 19}, {"name": "Technique", "value": 19}, {"name": "Passing", "value": 16}],
            "mental": [{"name": "Flair", "value": 18}, {"name": "Vision", "value": 17}, {"name": "Decisions", "value": 15}],
            "physical": [{"name": "Agility", "value": 19}, {"name": "Balance", "value": 18}, {"name": "Acceleration", "value": 17}]
        }
    },
    {
        "id": "kobbie-mainoo",
        "name": "Kobbie Mainoo",
        "club": "Manchester United",
        "league": "Premier League",
        "position": "CM",
        "age": 19,
        "nationality": "England",
        "market_value": "€55M",
        "predicted_growth": 18.2,
        "tactical_role": "Deep Lying Playmaker",
        "contract_expiry": "2027-06-30",
        "metrics": [
            {"label": "Composure", "value": 98},
            {"label": "IQ", "value": 94},
            {"label": "Retention", "value": 92}
        ],
        "attributes": {
            "technical": [{"name": "Technique", "value": 17}, {"name": "Passing", "value": 16}, {"name": "First Touch", "value": 18}],
            "mental": [{"name": "Composure", "value": 19}, {"name": "Decisions", "value": 17}, {"name": "Anticipation", "value": 16}],
            "physical": [{"name": "Agility", "value": 16}, {"name": "Balance", "value": 17}, {"name": "Natural Fitness", "value": 15}]
        }
    },
    {
        "id": "estevao-willian",
        "name": "Estêvão Willian",
        "club": "Palmeiras",
        "league": "Brasileirão",
        "position": "RW",
        "age": 17,
        "nationality": "Brazil",
        "market_value": "€40M",
        "predicted_growth": 25.5,
        "tactical_role": "Roaming Playmaker",
        "contract_expiry": "2029-06-30",
        "metrics": [{"label": "Dribbling", "value": 96}, {"label": "Agility", "value": 94}, {"label": "Vision", "value": 85}],
        "attributes": {
            "technical": [{"name": "Dribbling", "value": 19}, {"name": "Technique", "value": 18}, {"name": "Passing", "value": 15}],
            "mental": [{"name": "Flair", "value": 19}, {"name": "Vision", "value": 17}, {"name": "Composure", "value": 14}],
            "physical": [{"name": "Acceleration", "value": 18}, {"name": "Agility", "value": 19}, {"name": "Pace", "value": 17}]
        }
    }
]

def get_normalized_player(player: dict) -> dict:
    """Applies League Exchange rates to performance metrics."""
    import copy
    p = copy.deepcopy(player)
    league_factor = LEAGUE_STRENGTH.get(p.get("league", "Global"), 0.70)
    
    if "metrics" in p:
        for m in p["metrics"]:
            # Technical and creative stats are weighted by league difficulty
            if m["label"] in ["xT", "OBV", "Packing", "Passing", "Vision"]:
                m["value"] = int(m["value"] * league_factor)
                m["label"] = f"{m['label']} (Norm.)"
    return p

def calculate_ball_index(player: dict) -> float:
    """Calculates professional effectiveness rating based on dossiers."""
    if not player or "attributes" not in player:
        return 0.0
    
    tech = player["attributes"].get("technical", [])
    mental = player["attributes"].get("mental", [])
    phys = player["attributes"].get("physical", [])
    
    tech_score = sum([a["value"] for a in tech]) / (len(tech) or 1)
    mental_score = sum([a["value"] for a in mental]) / (len(mental) or 1)
    phys_score = sum([a["value"] for a in phys]) / (len(phys) or 1)
    
    # Weighting: Mental stability and technical ceiling are primary (40% each), physical longevity is secondary (20%)
    weighted_score = (tech_score * 0.4) + (mental_score * 0.4) + (phys_score * 0.2)
    
    # Scale from 0-20 to 0-100
    return round(weighted_score * 5, 1)
