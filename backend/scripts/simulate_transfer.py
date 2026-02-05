import json
import os

# Path to master DB
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file_path = os.path.join(base_dir, "data", "master_db_2025.json")

def simulate_transfer():
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Find Kenneth Taylor (ID: 20000999)
    for p in data["players"]:
        if p["fm_id"] == 20000999:
            print(f"Transferring {p['name']} from {p['club']} to Manchester United...")
            p["club"] = "Manchester United"
            p["league"] = "Premier League"
            p["shortlist_category"] = "Global Scouting Targets" # Valid category change
            break
            
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        print("Transfer signed! Master DB updated.")

if __name__ == "__main__":
    simulate_transfer()
