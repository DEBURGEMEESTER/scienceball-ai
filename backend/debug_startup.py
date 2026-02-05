import traceback
import sys

try:
    print("Attempting to import app.main...")
    from app.main import app
    print("Import SUCCESS!")
except Exception:
    with open("startup_error.log", "w") as f:
        traceback.print_exc(file=f)
    print("Import FAILED. Traceback written to startup_error.log")
