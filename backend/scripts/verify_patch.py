import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.data_sync import DataSyncService
from sqlmodel import Session, select
from app.core.db import engine
from app.models.player import Player

def verify_and_sync():
    print("🔄 Triggering Manual Sync via Service...")
    service = DataSyncService()
    stats = service.sync_database()
    print(f"✅ Sync Stats: {stats}")

    print("\n🔎 Verifying Kenneth Taylor...")
    with Session(engine) as session:
        taylor = session.exec(select(Player).where(Player.name == "Kenneth Taylor")).first()
        if taylor:
            print(f"👤 Name: {taylor.name}")
            print(f"🏟️ Club: {taylor.club}")
            
            if taylor.club == "Lazio":
                print("✅ VERIFIED: Player is at Lazio.")
            else:
                print(f"❌ MISMATCH: Player is at {taylor.club}")
        else:
            print("❌ ERROR: Kenneth Taylor not found in DB.")

if __name__ == "__main__":
    verify_and_sync()
