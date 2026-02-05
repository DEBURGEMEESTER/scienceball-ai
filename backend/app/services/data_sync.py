import json
import os
from typing import Dict, List, Any
from sqlmodel import Session, select
from app.models.player import Player, Shortlist, ShortlistPlayerLink
from app.core.db import engine

class DataSyncService:
    MASTER_DB_PATH = "data/master_db_2025.json"

    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.file_path = os.path.join(self.base_dir, self.MASTER_DB_PATH)

    def load_master_data(self) -> Dict[str, Any]:
        if not os.path.exists(self.file_path):
            return {"error": "Master DB file not found"}
        
        with open(self.file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def sync_database(self) -> Dict[str, int]:
        stats = {"updated": 0, "created": 0, "transfers": 0, "unchanged": 0}
        
        data = self.load_master_data()
        players_data = data.get("players", [])
        
        with Session(engine) as session:
            # Pre-fetch contexts (Shortlists)
            sl_targets = session.exec(select(Shortlist).where(Shortlist.name == "Global Scouting Targets")).first()
            sl_squad = session.exec(select(Shortlist).where(Shortlist.name == "Ajax First Team")).first()
            
            # Helper to manage list membership
            def update_list_membership(player_id, new_category):
                # Clear existing links to these specific lists
                links = session.exec(select(ShortlistPlayerLink).where(ShortlistPlayerLink.player_id == player_id)).all()
                for link in links:
                    if link.shortlist_id in [sl_targets.id, sl_squad.id]:
                        session.delete(link)
                
                # Add new link
                target_list = sl_squad if new_category == "Ajax First Team" else sl_targets
                if target_list:
                    session.add(ShortlistPlayerLink(shortlist_id=target_list.id, player_id=player_id))

            for p_data in players_data:
                fm_id = p_data.get("fm_id")
                p_id = p_data.get("id")
                
                # Meta fields
                shortlist_category = p_data.pop("shortlist_category", "Global Scouting Targets")
                is_shortlisted = p_data.pop("is_shortlisted", False)

                # Find existing
                existing = None
                if fm_id:
                    existing = session.exec(select(Player).where(Player.fm_id == fm_id)).first()
                if not existing:
                    existing = session.exec(select(Player).where(Player.id == p_id)).first()
                
                if existing:
                    # Check for Transfer (Club Change)
                    if existing.club != p_data.get("club"):
                        stats["transfers"] += 1
                        # If transfer happens, we might need to change list membership logic here 
                        # but for now we trust the master DB's 'shortlist_category'
                    
                    # Update fields
                    has_changes = False
                    for key, value in p_data.items():
                        if getattr(existing, key) != value:
                            setattr(existing, key, value)
                            has_changes = True
                    
                    if has_changes:
                        session.add(existing)
                        stats["updated"] += 1
                    else:
                        stats["unchanged"] += 1
                    
                    # Update List Membership
                    if is_shortlisted:
                        update_list_membership(existing.id, shortlist_category)

                else:
                    # Create New
                    new_player = Player(**p_data)
                    session.add(new_player)
                    session.commit() # Commit to get ID
                    session.refresh(new_player)
                    
                    if is_shortlisted:
                        update_list_membership(new_player.id, shortlist_category)
                    
                    stats["created"] += 1

            session.commit()
            
        return stats
