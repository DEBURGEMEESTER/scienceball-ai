import sqlite3

def migrate():
    try:
        conn = sqlite3.connect('scienceball.db')
        cursor = conn.cursor()
        
        # Check if is_admin exists
        cursor.execute("PRAGMA table_info(club)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'is_admin' not in columns:
            print("Adding is_admin column to club table...")
            cursor.execute("ALTER TABLE club ADD COLUMN is_admin BOOLEAN DEFAULT 0")
            conn.commit()
            print("Migration successful.")
        else:
            print("is_admin column already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
