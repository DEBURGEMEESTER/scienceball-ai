import requests
import json

print("Fetching targets...")
try:
    res = requests.get("http://127.0.0.1:8000/director/priority-targets")
    print(f"Status Code: {res.status_code}")
    print(f"Raw Response: {res.text[:200]}...") # Print first 200 chars
    
    if res.status_code != 200:
        print("Error: Non-200 status code")
        exit(1)

    targets = res.json()
    print(f"Targets Type: {type(targets)}")

    if isinstance(targets, list) and len(targets) > 0:
        target_id = targets[0]['id']
        print(f"Testing with Target: {targets[0]['name']} ({target_id})")
        
        res_profile = requests.get(f"http://127.0.0.1:8000/players/{target_id}")
        profile = res_profile.json()
        
        print("\n--- ATTRIBUTES (Generated) ---")
        item = profile.get('attributes', {}).get('technical', [])
        print(json.dumps(item, indent=2))
        
        if not item:
            print("FAILURE: Technical attributes are empty.")
        else:
            print("SUCCESS: Attributes present.")

        print("\n--- SCIENTIFIC DOSSIER ---")
        dossier = profile.get('scientific_dossier')
        print(dossier)
        
        if not dossier:
             print("FAILURE: No dossier found.")
    else:
        print("No targets found to test.")

except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Test Failed: {e}")
