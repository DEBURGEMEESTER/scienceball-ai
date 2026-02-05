import requests
try:
    response = requests.get("http://127.0.0.1:8000/director/priority-targets")
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Type: {type(data)}")
    print(f"Data: {data}")
except Exception as e:
    print(f"Error: {e}")
