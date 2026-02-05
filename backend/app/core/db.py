from sqlmodel import create_engine, Session, SQLModel
from app.models.player import Player, Shortlist, ScoutNote
from app.models.auth import Club, User
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("WARNING: DATABASE_URL not set, falling back to local sqlite")
    DATABASE_URL = "sqlite:///./scienceball.db"

# SQLAlchemy 1.4+ requires 'postgresql://' instead of 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if "://" not in DATABASE_URL:
    print(f"CRITICAL ERROR: DATABASE_URL looks like a hostname ({DATABASE_URL}), not a connection string!")
    print("Please copy the full 'PostgreSQL Connection URL' from the Database Variables tab, not the domain name.")
    raise ValueError("Invalid DATABASE_URL format. Expected full connection string (postgresql://...)")

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args["check_same_thread"] = False

try:
    engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
except Exception as e:
    print(f"CRITICAL: SQLAlchemy failed to parse your URL: {DATABASE_URL[:20]}...")
    raise e

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

def seed_data():
    from app.core.database import PLAYERS_DB
    with Session(engine) as session:
        # 1. Seed Clubs
        print("Seeding clubs...")
        clubs_to_seed = [
            Club(name="Ajax", access_key="amsterdam1900", primary_color="#D2122E", secondary_color="#FFFFFF", accent_color="#C0C0C0"),
            Club(name="Feyenoord", access_key="rotterdam1908", primary_color="#E30613", secondary_color="#FFFFFF", accent_color="#000000"),
            Club(name="ScienceBall HQ", access_key="admin2026", primary_color="#00f2ff", secondary_color="#7000ff", accent_color="#ff007a", is_admin=True),
        ]
        
        for club_data in clubs_to_seed:
            existing = session.exec(select(Club).where(Club.name == club_data.name)).first()
            if not existing:
                session.add(club_data)
        
        session.commit()

        # 2. Seed Players
        if session.query(Player).first():
            print("Players already seeded.")
            return

        print("Seeding database with professional scouting data...")
        
        # Create Default Shortlist
        general = Shortlist(name="General Shortlist")
        session.add(general)
        
        for p_data in PLAYERS_DB:
            player = Player(
                id=p_data.get("id"),
                name=p_data.get("name", "Unknown Player"),
                club=p_data.get("club", "Free Agent"),
                league=p_data.get("league", "Unknown"),
                position=p_data.get("position", "MID"),
                age=p_data.get("age", 20),
                nationality=p_data.get("nationality", "Unknown"),
                image=p_data.get("image", "/defaults/player_placeholder.png"),
                market_value=p_data.get("market_value", "€0M"),
                predicted_growth=p_data.get("predicted_growth", 5.0),
                tactical_role=p_data.get("tactical_role", "Balanced"),
                metrics=p_data.get("metrics", []),
                attributes=p_data.get("attributes", {}),
                medical_dna=p_data.get("medical_dna", {}),
                physical_metrics=p_data.get("physical_metrics", {}),
                cognitive_profile=p_data.get("cognitive_profile", {}),
                biometric_profile=p_data.get("biometric_profile", {}),
                scientific_dossier=p_data.get("scientific_dossier")
            )
            session.add(player)
            
            # Add notes
            for n_data in p_data.get("scout_notes", []):
                note = ScoutNote(
                    player_id=player.id,
                    scout=n_data["scout"],
                    note=n_data["note"],
                    date=n_data["date"]
                )
                session.add(note)
                
        session.commit()
        print("Migration complete. 30+ players migrated to SQL.")
