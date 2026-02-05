import sqlite3
from app.core.db import init_db

def check_db():
    init_db()
    conn = sqlite3.connect('scienceball.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name, access_key, is_admin FROM club")
    clubs = cursor.fetchall()
    print("Seeded Clubs:", clubs)
    conn.close()

if __name__ == "__main__":
    check_db()
