import os
import json
import sys

print(f"CWD: {os.getcwd()}")
try:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", "master_db_2025.json")
    print(f"Target Path: {data_path}")
    
    if os.path.exists(data_path):
        print("File exists.")
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            print(f"JSON Loaded. Keys: {list(data.keys())}")
            print(f"Players found: {len(data.get('players', []))}")
    else:
        print("File DOES NOT exist.")
        print(f"Listing {os.path.dirname(data_path)}:")
        print(os.listdir(os.path.dirname(data_path)))
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
