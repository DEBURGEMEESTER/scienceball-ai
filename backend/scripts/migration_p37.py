import sqlite3
import os

db_path = "scienceball.db"
print(f"Migrating {db_path}...")

if not os.path.exists(db_path):
    print("DB file not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column exists
    cursor.execute("PRAGMA table_info(player)")
    columns = [info[1] for info in cursor.fetchall()]
    if "fm_id" in columns:
        print("Column 'fm_id' already exists.")
    else:
        print("Adding 'fm_id' column...")
        cursor.execute("ALTER TABLE player ADD COLUMN fm_id INTEGER")
        conn.commit()
        print("Migration successful.")
        
except Exception as e:
    print(f"Error: {e}")
    
finally:
    conn.close()
