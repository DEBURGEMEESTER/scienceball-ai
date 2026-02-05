from sqlmodel import Session, select
from app.core.db import engine, init_db
from app.models.auth import Club

def force_seed():
    init_db()
    with Session(engine) as session:
        clubs = [
            Club(name="Ajax", access_key="amsterdam1900", primary_color="#D2122E", secondary_color="#FFFFFF", accent_color="#C0C0C0"),
            Club(name="Feyenoord", access_key="rotterdam1908", primary_color="#E30613", secondary_color="#FFFFFF", accent_color="#000000"),
            Club(name="ScienceBall Alpha", access_key="tester2026", primary_color="#00f2ff", secondary_color="#7000ff", accent_color="#ff007a"),
            Club(name="ScienceBall HQ", access_key="admin2026", primary_color="#00f2ff", secondary_color="#7000ff", accent_color="#ff007a", is_admin=True),
        ]
        
        for club_data in clubs:
            existing = session.exec(select(Club).where(Club.name == club_data.name)).first()
            if not existing:
                print(f"Adding club: {club_data.name}")
                session.add(club_data)
        
        session.commit()
        print("Force seeding complete.")

if __name__ == "__main__":
    force_seed()
