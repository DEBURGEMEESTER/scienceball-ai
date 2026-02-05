from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlmodel import Session, select
from app.core.db import engine
from app.models.player import Player
import pandas as pd
import io
import uuid

router = APIRouter(prefix="/import", tags=["importer"])

from app.core.database import LEAGUE_STRENGTH

# Mapping Aliases for Robust Ingestion
ATTRIBUTE_MAP = {
    "technical": ["finishing", "passing", "dribbling", "first touch", "touch", "tackling", "crossing", "heading", "long shots", "marking", "technique", "corners", "free kick", "penalties"],
    "mental": ["aggression", "anticipation", "bravery", "composure", "concentration", "decisions", "determination", "flair", "leadership", "off the ball", "positioning", "teamwork", "vision", "work rate"],
    "physical": ["acceleration", "agility", "balance", "jumping reach", "natural fitness", "pace", "stamina", "strength", "speed"]
}

HEADER_ALIASES = {
    "name": ["player", "full name", "full_name"],
    "club": ["team", "side"],
    "position": ["pos", "role"],
    "age": ["years"],
    "league": ["competition", "division"],
    "nationality": ["nation", "country"],
    "market_value": ["value", "price", "valuation"],
    "predicted_growth": ["growth", "potential_growth"],
}

REQUIRED_COLUMNS = ["name", "club", "position", "age"]

STATS_MAP = {
    "pace": ["pace", "acceleration", "speed"],
    "shooting": ["shooting", "finishing", "long shots"],
    "passing": ["passing", "vision", "crossing"],
    "dribbling": ["dribbling", "flair", "technique"],
    "defending": ["defending", "tackling", "marking", "positioning"],
    "physical": ["physical", "strength", "stamina", "agility"]
}

@router.post("/upload")
async def upload_players(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV or Excel file.")
    
    contents = await file.read()
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {str(e)}")
    
    # Normalize headers to lowercase
    raw_cols = df.columns.astype(str).str.lower().str.strip()
    df.columns = raw_cols
    
    # Robust Header Remapping
    for target, aliases in HEADER_ALIASES.items():
        if target not in df.columns:
            for alias in aliases:
                if alias in df.columns:
                    df.rename(columns={alias: target}, inplace=True)
                    break

    # Check for required columns again after remapping
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing_cols)}")
    
    players_added = 0
    with Session(engine) as session:
        for _, row in df.iterrows():
            # Check if player exists
            existing = session.exec(select(Player).where(Player.name == row['name']).where(Player.club == row['club'])).first()
            if existing: continue

            league = row.get('league', 'Unknown League')
            league_factor = LEAGUE_STRENGTH.get(league, 0.70)
            
            # Structured Attributes
            structured_attrs = {"technical": [], "mental": [], "physical": []}
            explicit_stats = {
                "pace": 0, "shooting": 0, "passing": 0, 
                "dribbling": 0, "defending": 0, "physical": 0
            }
            
            for category, attr_list in ATTRIBUTE_MAP.items():
                for attr_name in attr_list:
                    if attr_name in df.columns:
                        raw_val = row[attr_name]
                        if pd.isna(raw_val): continue
                        
                        # Apply League Normalization for technical/mental
                        try:
                            val = int(raw_val)
                        except:
                            continue
                            
                        if category in ["technical", "mental"]:
                            val = max(1, min(20, int(val * league_factor))) if val <= 20 else max(1, min(99, int(val * league_factor)))
                        
                        structured_attrs[category].append({
                            "name": attr_name.title(),
                            "value": val
                        })
                        
                        # Map to explicit stats
                        for stat_key, aliases in STATS_MAP.items():
                            if attr_name.lower() in aliases:
                                explicit_stats[stat_key] = max(explicit_stats[stat_key], val)

            # Robust Market Value
            mv_raw = str(row.get('market_value', '€1.0M'))
            if not mv_raw.startswith('€'): mv_raw = f"€{mv_raw}"
            if not mv_raw.endswith(('M', 'K')): mv_raw = f"{mv_raw}M"

            new_player = Player(
                id=str(uuid.uuid4()),
                name=row['name'],
                club=row['club'],
                league=league,
                position=row['position'],
                age=int(row['age']),
                nationality=row.get('nationality', 'Unknown'),
                image=row.get('image', '/defaults/player_placeholder.png'),
                market_value=mv_raw,
                predicted_growth=float(row.get('predicted_growth', 5.0)),
                tactical_role=row.get('tactical_role', 'Balanced'),
                contract_expiry=str(row.get('contract_expiry', '2026-06-30')),
                metrics=[],
                attributes=structured_attrs,
                **explicit_stats
            )
            
            session.add(new_player)
            players_added += 1
        
        session.commit()
    
    return {"status": "success", "players_added": players_added, "total_rows_processed": len(df)}
