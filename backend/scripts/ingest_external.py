import os
import json
import csv
import difflib
from typing import List, Dict, Any

class ExternalIngestionEngine:
    MASTER_DB_PATH = "data/master_db_2025.json"
    INCOMING_DIR = "data/incoming"

    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.master_path = os.path.join(self.base_dir, self.MASTER_DB_PATH)
        self.incoming_path = os.path.join(self.base_dir, self.INCOMING_DIR)

    def load_master_db(self) -> Dict[str, Any]:
        with open(self.master_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def save_master_db(self, data: Dict[str, Any]):
        with open(self.master_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
        print("✅ Master DB Saved and Updated.")

    def fuzzy_match_player(self, name: str, master_players: List[Dict]) -> Dict:
        """
        Uses difflib to find the best matching player name in the master DB.
        Returns the player object if a high-confidence match is found.
        """
        existing_names = [p["name"] for p in master_players]
        matches = difflib.get_close_matches(name, existing_names, n=1, cutoff=0.85)
        
        if matches:
            matched_name = matches[0]
            for p in master_players:
                if p["name"] == matched_name:
                    return p
        return None

    def convert_stat_to_rating(self, stat_name: str, raw_value: float) -> int:
        """
        Proprietary algorithm to convert raw stats (e.g., 0.5 xG/90) to 1-20 Attributes or 0-100 Metrics.
        This is a simplified version for demonstration.
        """
        # Example conversions
        if stat_name == "xG":
            # 0.0 -> 0.8 scale mapped to 0-100
            rating = min(100, int((raw_value / 0.8) * 100))
            return rating
        if stat_name == "PassCompletion":
            # 60% -> 95% scale
            rating = min(100, int(((raw_value - 60) / 35) * 100))
            return max(0, rating)
        
        # Default: ensure it's a valid integer
        try:
            return int(float(raw_value))
        except:
            return 0

    def ingest_csv(self, filename: str):
        file_path = os.path.join(self.incoming_path, filename)
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return

        master_data = self.load_master_db()
        master_players = master_data.get("players", [])
        
        print(f"📂 Processing {filename}...")
        
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            updated_count = 0
            
            for row in reader:
                name = row.get("Name")
                if not name:
                    continue
                
                # 1. Fuzzy Match
                player = self.fuzzy_match_player(name, master_players)
                
                if player:
                    print(f"   🔍 Match found: '{name}' -> '{player['name']}'")
                    
                    # 2. Update Logic (Example: Update stats if present)
                    if "xG" in row:
                        val = self.convert_stat_to_rating("xG", float(row["xG"]))
                        # Update a metric inside the complex structure
                        # For simplicity, let's just create/update a dedicated metric
                        found = False
                        for m in player.get("metrics", []):
                            if m["label"] == "Finishing Potential":
                                m["value"] = val
                                found = True
                        if not found:
                            player.setdefault("metrics", []).append({"label": "Finishing Potential", "value": val})
                        
                        updated_count += 1
                else:
                    print(f"   ⚠️ No match for '{name}'. Skipping (Auto-creation disabled for safety).")

        # Save changes
        if updated_count > 0:
            self.save_master_db(master_data)
            print(f"🎉 Successfully updated {updated_count} players with community intelligence.")
        else:
            print("ℹ️ No updates applied.")

if __name__ == "__main__":
    engine = ExternalIngestionEngine()
    # Check for any CSV files in the incoming directory
    files = [f for f in os.listdir(engine.incoming_path) if f.endswith('.csv')]
    if files:
        for f in files:
            engine.ingest_csv(f)
    else:
        print("📭 Drop Zone is empty. Place CSV files in 'backend/data/incoming' to ingest.")
