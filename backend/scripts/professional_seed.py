import os
import sys

# Ensure backend root is in path
sys.path.append(os.getcwd())

from sqlmodel import Session, select, SQLModel
from app.core.db import engine
from app.models.player import Player, Shortlist, ShortlistPlayerLink, ScoutNote

import os
import sys
import json

# Ensure backend root is in path
sys.path.append(os.getcwd())

from sqlmodel import Session, select, SQLModel
from app.core.db import engine
from app.models.player import Player, Shortlist, ShortlistPlayerLink

def load_master_db():
    try:
        # Construct absolute path to ensure file is found
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_path = os.path.join(base_dir, "data", "master_db_2025.json")
        print(f"Loading Master DB from: {data_path}")
        
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("players", [])
    except Exception as e:
        print(f"CRITICAL ERROR loading Master DB: {e}")
        import traceback
        traceback.print_exc()
        return []

def seed_professional_data():
    print("Initializing Enterprise Data Ingestion...")
    
    # Load Master Data
    master_players = load_master_db()
    if not master_players:
        print("Abort: No data to seed.")
        return

    # Ensure tables exist (Safety check)
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Create or Get Shortlists
        sl_targets = session.exec(select(Shortlist).where(Shortlist.name == "Global Scouting Targets")).first()
        if not sl_targets:
            sl_targets = Shortlist(name="Global Scouting Targets")
            session.add(sl_targets)
            
        sl_squad = session.exec(select(Shortlist).where(Shortlist.name == "Ajax First Team")).first()
        if not sl_squad:
            sl_squad = Shortlist(name="Ajax First Team")
            session.add(sl_squad)
        
        session.commit()
        session.refresh(sl_targets)
        session.refresh(sl_squad)
        
        # Process Master Data
        count = 0
        for p_data in master_players:
            # Extract meta-fields that aren't in the Player model directly
            shortlist_category = p_data.pop("shortlist_category", "Global Scouting Targets")
            is_shortlisted = p_data.pop("is_shortlisted", False)
            
            # Check if player exists by FM_ID (Ideal) or ID (Fallback)
            existing = None
            if "fm_id" in p_data and p_data["fm_id"]:
                existing = session.exec(select(Player).where(Player.fm_id == p_data["fm_id"])).first()
            
            if not existing:
                existing = session.exec(select(Player).where(Player.id == p_data["id"])).first()

            if existing:
                # Update existing record
                for key, value in p_data.items():
                    setattr(existing, key, value)
                session.add(existing)
                print(f"-> Updated: {existing.name}")
            else:
                # Create new record
                new_player = Player(**p_data)
                session.add(new_player)
                session.commit() # Commit to get ID for linking
                session.refresh(new_player)
                existing = new_player
                print(f"-> Created: {new_player.name}")
                count += 1

            # Manage Shortlist Links
            target_list_id = sl_squad.id if shortlist_category == "Ajax First Team" else sl_targets.id
            
            # Check link
            link = session.exec(select(ShortlistPlayerLink).where(
                ShortlistPlayerLink.shortlist_id == target_list_id,
                ShortlistPlayerLink.player_id == existing.id
            )).first()
            
            if not link and is_shortlisted:
                session.add(ShortlistPlayerLink(shortlist_id=target_list_id, player_id=existing.id))

        session.commit()
        print(f"Ingestion Complete. Processed {len(master_players)} records.")

if __name__ == "__main__":
    seed_professional_data()
