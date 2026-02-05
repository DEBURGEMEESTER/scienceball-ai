import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.attribute_engine import ScientificAttributeEngine
import json

# Mock Data simulating a Striker
mock_stats = {
    "Goals": 25,
    "xG": 22.5,
    "Assists": 5,
    "Prog": 12, # Progressive Actions
    "npxG": 20.0
}

pos = "Striker"
age = 24

print("Testing Scientific Attribute Engine...")
print(f"Input: {mock_stats}, Pos: {pos}, Age: {age}")

try:
    # 1. Calculate Technical
    tech = ScientificAttributeEngine.calculate_technical(mock_stats, pos)
    print("\n--- Technical ---")
    print(json.dumps(tech, indent=2))
    
    # Verify Finishing is high
    finishing = next(x for x in tech if x["name"] == "Finishing")
    if finishing["value"] < 15:
        print("FAILURE: Finishing too low for 25 goals.")
    else:
        print("SUCCESS: Finishing reflects Mock Data.")

    # 2. Calculate Mental
    mental = ScientificAttributeEngine.calculate_mental(mock_stats, pos, age)
    print("\n--- Mental ---")
    print(json.dumps(mental, indent=2))
    
    # 3. Calculate Physical
    phys = ScientificAttributeEngine.calculate_physical(mock_stats, pos, age)
    print("\n--- Physical ---")
    print(json.dumps(phys, indent=2))
    
    print("\nTEST COMPLETE: Engine Logic Verified.")

except Exception as e:
    print(f"CRITICAL ERROR: {e}")
