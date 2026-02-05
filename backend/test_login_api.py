import requests

def test_login():
    url = "http://127.0.0.1:8000/auth/login"
    payload = {
        "email": "lcjmoons@gmail.com",
        "access_key": "admin2026"
    }
    try:
        print(f"Sending login request to {url}...")
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error during login request: {e}")

if __name__ == "__main__":
    test_login()
