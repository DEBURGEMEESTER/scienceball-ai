import uuid
import random
from app.core.db import engine, init_db
from app.models.player import Player
from app.core.database import PLAYERS_DB
from sqlmodel import Session, select

def seed_mock_to_sql():
    print(f"🧬 Starting Migration: {len(PLAYERS_DB)} Elite Dossiers identified...")
    init_db()
    
    with Session(engine) as session:
        added_count = 0
        for p_mock in PLAYERS_DB:
            # Check if exists
            existing = session.exec(select(Player).where(Player.name == p_mock['name'])).first()
            if existing:
                continue
            
            # Map attributes to explicit stats
            explicit_stats = {
                "pace": 0, "shooting": 0, "passing": 0, 
                "dribbling": 0, "defending": 0, "physical": 0
            }
            
            # Extract from metrics
            for m in p_mock.get('metrics', []):
                label = m['label'].lower()
                val = m['value']
                if "pace" in label or "speed" in label: explicit_stats["pace"] = max(explicit_stats["pace"], val)
                if "shooting" in label or "finishing" in label: explicit_stats["shooting"] = max(explicit_stats["shooting"], val)
                if "passing" in label: explicit_stats["passing"] = max(explicit_stats["passing"], val)
                if "dribbling" in label: explicit_stats["dribbling"] = max(explicit_stats["dribbling"], val)
                if "defense" in label or "defending" in label: explicit_stats["defending"] = max(explicit_stats["defending"], val)
                if "physical" in label or "stamina" in label: explicit_stats["physical"] = max(explicit_stats["physical"], val)

            # Map from structured attributes if metrics was sparse
            attrs = p_mock.get('attributes', {})
            for category in ["technical", "mental", "physical"]:
                for attr in attrs.get(category, []):
                    name = attr['name'].lower()
                    val = attr['value']
                    # Scaling 1-20 to 1-99 for explicit stats
                    scaled_val = int(val * 5) if val <= 20 else val
                    
                    if name in ["pace", "acceleration", "speed"]: explicit_stats["pace"] = max(explicit_stats["pace"], scaled_val)
                    if name in ["shooting", "finishing"]: explicit_stats["shooting"] = max(explicit_stats["shooting"], scaled_val)
                    if name in ["passing", "vision"]: explicit_stats["passing"] = max(explicit_stats["passing"], scaled_val)
                    if name in ["dribbling", "technique"]: explicit_stats["dribbling"] = max(explicit_stats["dribbling"], scaled_val)
                    if name in ["defending", "tackling", "marking"]: explicit_stats["defending"] = max(explicit_stats["defending"], scaled_val)
                    if name in ["physical", "strength", "stamina", "agility"]: explicit_stats["physical"] = max(explicit_stats["physical"], scaled_val)

            # Create SQL Player object
            new_player = Player(
                id=p_mock.get('id', str(uuid.uuid4())) if '-' in p_mock.get('id', '') else str(uuid.uuid4()),
                name=p_mock.get('name', 'Unknown Prospect'),
                club=p_mock.get('club', 'Free Agent'),
                league=p_mock.get('league', 'International'),
                position=p_mock.get('position', 'VAR'),
                age=p_mock.get('age', 22),
                nationality=p_mock.get('nationality', 'Unknown'),
                image=p_mock.get('image', '/defaults/player_placeholder.png'),
                market_value=p_mock.get('market_value', '€1.0M'),
                predicted_growth=p_mock.get('predicted_growth', 5.0),
                tactical_role=p_mock.get('tactical_role', 'Balanced'),
                contract_expiry="2027-06-30",
                metrics=p_mock.get('metrics', []),
                attributes=p_mock.get('attributes', {}),
                medical_dna=p_mock.get('medical_dna', {}),
                physical_metrics=p_mock.get('physical_metrics', {}),
                cognitive_profile=p_mock.get('cognitive_profile', {}),
                biometric_profile=p_mock.get('biometric_profile', {}),
                scientific_dossier=p_mock.get('scientific_dossier'),
                **explicit_stats
            )
            
            session.add(new_player)
            added_count += 1
            
        session.commit()
        print(f"🚀 Success! Seeded {added_count} elite dossiers into the persistent Core Intelligence Database.")

if __name__ == "__main__":
    seed_mock_to_sql()
