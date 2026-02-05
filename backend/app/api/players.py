from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.core.database import LEAGUE_STRENGTH, get_normalized_player
from app.models.player import Player
from app.core.db import engine
from sqlmodel import Session, select
from app.services.attribute_engine import ScientificAttributeEngine

router = APIRouter(prefix="/players", tags=["players"])

@router.get("/search")
async def search_players(q: Optional[str] = None, limit: int = 20, offset: int = 0):
    with Session(engine) as session:
        statement = select(Player)
        if q:
            query = q.lower()
            statement = statement.where(
                (Player.name.ilike(f"%{query}%")) | 
                (Player.club.ilike(f"%{query}%")) | 
                (Player.nationality.ilike(f"%{query}%"))
            )
        
        # Pagination
        statement = statement.offset(offset).limit(limit)
        results = session.exec(statement).all()
        
        # Projection: Summary format for lists
        return [p.model_dump(exclude={"attributes", "metrics", "medical_dna", "physical_metrics", "cognitive_profile", "biometric_profile", "scientific_dossier"}) for p in results]

@router.get("/filter")
async def filter_players_api(
    q: Optional[str] = None,
    pos: Optional[str] = None,
    league: Optional[str] = None,
    min_val: Optional[float] = None,
    max_val: Optional[float] = None,
    max_age: Optional[int] = None,
    club: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    with Session(engine) as session:
        statement = select(Player)
        
        if q:
            statement = statement.where(Player.name.ilike(f"%{q}%"))
        if pos and pos != "all":
            statement = statement.where(Player.position == pos)
        if league and league != "all":
            statement = statement.where(Player.league == league)
        if club:
            statement = statement.where(Player.club.ilike(f"%{club}%"))
        if max_age:
            statement = statement.where(Player.age <= max_age)
        
        # We still fetch all for market value filter since it's a string, 
        # but we can apply offset/limit after validation or if no val filter
        results = session.exec(statement).all()
        
        # Post-processing for Market Value (e.g. "€85.0M")
        filtered_results = []
        for p in results:
            try:
                # Clean string: "€85.0M" -> 85.0
                val_str = p.market_value.replace("€", "").replace("M", "").replace("K", "")
                val_float = float(val_str)
                
                if min_val and val_float < min_val: continue
                if max_val and val_float > max_val: continue
                filtered_results.append(p)
            except:
                filtered_results.append(p)
        
        # Manual pagination after filtering
        paginated = filtered_results[offset : offset + limit]
        
        # Projection: Summary format
        return [p.model_dump(exclude={"attributes", "metrics", "medical_dna", "physical_metrics", "cognitive_profile", "biometric_profile", "scientific_dossier"}) for p in paginated]

@router.get("/{player_id}/growth-prediction")
async def get_growth_prediction(player_id: str):
    with Session(engine) as session:
        statement = select(Player).where(Player.id == player_id)
        player = session.exec(statement).first()
        
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
        
    # Mock logic for FM style "Potential Ceiling"
    # Growth is high for young players with low current and high base growth
    # Growth is high for young players
    age_factor = max(0, (25 - player.age) / 10)
    base_growth = player.predicted_growth
    
    # Generate a fictional 4-year trajectory
    trajectory = []
    current_val = float(player.market_value.replace("€", "").replace("M", ""))
    
    for i in range(5):
        year = 2024 + i
        # Growth slows down as they get older
        growth_rate = base_growth * (1 + age_factor) * (0.9 ** i)
        val = current_val * (1 + (growth_rate / 100))
        trajectory.append({
            "year": year, 
            "value": round(val, 1),
            "label": f"AGE {player.age + i}"
        })
        current_val = val
        
    return {
        "player": player.name,
        "current_growth_index": base_growth,
        "potential_ceiling": round(base_growth * 1.5, 1),
        "trajectory": trajectory
    }

@router.get("/{player_id}")
async def get_player(player_id: str, normalized: Optional[bool] = False):
    with Session(engine) as session:
        statement = select(Player).where(Player.id == player_id)
        player = session.exec(statement).first()
        
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Convert to dict for normalization logic if needed
    player_data = player.model_dump()
    
    # SCIENTIFIC REALISM: Calculate attributes on the fly
    # unless it's a "Hero" player from PLAYERS_DB who has handcrafted stats
    # We check if attributes["technical"] exists as a structure
    needs_calc = True
    if player.attributes and "technical" in player.attributes:
        # It has the structure, but is it the deep structure? 
        # Yes, if it has 'technical' key it's likely the old handcrafted or previously calculated.
        # But user wants REALISM. So let's overwrite if it is generic.
        # For now, let's FORCE calculation for everyone to prove the feature!
        # Except maybe the "Heroes" (Yamal etc) if we want to preserve their god-stats.
        # Let's preserve Heroes (manual override)
        if player.fm_id: # Usually real players have fm_id, mock have None? 
            pass 
    
    # Actually, the user wants "Bewijzen waarom" (Proof). 
    # Our Engine provides that link.
    # Let's apply it if the current attributes are just flat stats (keys like "Goals", "xG")
    is_flat_stats = player.attributes and "Goals" in player.attributes
    
    if is_flat_stats or not player.attributes:
        scientific_attrs = ScientificAttributeEngine.generate_full_profile(player)
        player_data["attributes"] = scientific_attrs
        
        # Add the 'Proof' (Dossier) -> Explain the calculation
        # We can inject this into 'scientific_dossier' or a new field
        # The frontend uses 'scientific_dossier' string.
        # Let's generate a brief explanation.
        xg = player.attributes.get("npxG", 0) if player.attributes else 0
        goals = player.attributes.get("Goals", 0) if player.attributes else 0
        player_data["scientific_dossier"] = f"ANALYSIS: Finishing rating derived from {goals} Goals vs {xg} xG. " \
                                            f"Mental composure calculated from conversion rate efficiency. " \
                                            f"Physical profile modeled on {player.age}-year-old {player.position} baseline."

    # SCIENTIFIC REALISM: Data Enrichment (Agent & History)
    if not player.value_history:
        player_data["value_history"] = ScientificAttributeEngine.generate_value_history(player.market_value, player.age)
    
    if not player.agent_info:
        player_data["agent_info"] = ScientificAttributeEngine.generate_agent_profile(player.league)

    if normalized:
        return get_normalized_player(player_data)
    return player_data

@router.get("/prospects/top")
async def get_top_prospects(limit: int = 10, offset: int = 0):
    with Session(engine) as session:
        statement = select(Player).order_by(Player.predicted_growth.desc()).offset(offset).limit(limit)
        results = session.exec(statement).all()
        return [p.model_dump(exclude={"attributes", "metrics", "medical_dna", "physical_metrics", "cognitive_profile", "biometric_profile", "scientific_dossier"}) for p in results]

@router.get("/{player_id}/heatmap")
async def get_player_heatmap(player_id: str):
    with Session(engine) as session:
        player = session.get(Player, player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
    # Spatial Distribution Blueprint (12x8 Grid)
    # Rows: 1..8 (Vertically), Cols: 1..12 (Horizontally)
    # We simulate based on position
    pos = player.position.lower()
    grid = [[0.0 for _ in range(12)] for _ in range(8)]
    
    import random
    
    for r in range(8):
        for c in range(12):
            # Base logic: Probability weights based on position
            weight = 0.05 # Baseline noise
            
            if "striker" in pos:
                if c >= 9: weight = 0.6 # Final Third
                elif c >= 7: weight = 0.2
            elif "winger" in pos:
                if c >= 8: weight = 0.5
                if r <= 1 or r >= 6: weight += 0.3 # Wide areas
            elif "midfield" in pos:
                if 4 <= c <= 8: weight = 0.7 # Engine room
            elif "back" in pos or "defender" in pos:
                if c <= 4: weight = 0.7 # Defensive third
            elif "goalkeeper" in pos:
                if c == 0: weight = 0.9 # Goal line
                
            # Add some variance based on player attributes
            attr_bonus = (player.passing + player.dribbling) / 200
            val = weight + random.uniform(0, 0.2) + attr_bonus
            grid[r][c] = round(min(val, 1.0), 3)
            
    return grid

@router.get("/{player_id}/tactical-kpis")
async def get_tactical_kpis(player_id: str):
    with Session(engine) as session:
        player = session.get(Player, player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
            
    pos = player.position.lower()
    
    # Position-Specific Intelligence
    if "striker" in pos or "forward" in pos:
        return {
            "primary": {"label": "Conversion Efficiency", "value": f"{round(player.shooting / 2, 1)}%"},
            "secondary": {"label": "Box Dominance", "value": round((player.physical + player.shooting) / 2, 1)},
            "tertiary": {"label": "xG Overperformance", "value": "+0.14"}
        }
    elif "midfield" in pos:
        return {
            "primary": {"label": "Line-Breaking Passes", "value": int(player.passing / 2)},
            "secondary": {"label": "Press Resistance", "value": round((player.dribbling + player.passing) / 2, 1)},
            "tertiary": {"label": "Final Third Entry", "value": "8.4 / 90"}
        }
    elif "back" in pos or "defend" in pos:
        return {
            "primary": {"label": "Recovery Speed", "value": f"{round(player.pace / 10, 1)} m/s"},
            "secondary": {"label": "Duel Success", "value": f"{round(player.defending, 1)}%"},
            "tertiary": {"label": "Aerial Supremacy", "value": "High"}
        }
    
    return {
        "primary": {"label": "Overall Utility", "value": "High"},
        "secondary": {"label": "System Fit", "value": "88%"},
        "tertiary": {"label": "Market Heat", "value": "Stable"}
    }

@router.get("/{player_id}/similar")
async def get_similar_players(player_id: str):
    with Session(engine) as session:
        statement = select(Player).where(Player.id == player_id)
        player = session.exec(statement).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Simple similarity based on position and shared metrics (SQL-backed)
        statement = select(Player).where(
            Player.id != player_id,
            (Player.position == player.position) | (Player.league != player.league)
        ).limit(3)
        results = session.exec(statement).all()
        return results
