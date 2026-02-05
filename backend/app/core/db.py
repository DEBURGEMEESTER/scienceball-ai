from sqlmodel import create_engine, Session, SQLModel
from app.models.player import Player, Shortlist, ScoutNote
from app.models.auth import Club, User
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./scienceball.db")

# SQLAlchemy 1.4+ requires 'postgresql://' instead of 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

def seed_data():
    from app.core.database import PLAYERS_DB, LEAGUE_STRENGTH
    with Session(engine) as session:
        # Check if already seeded
        if session.query(Player).first():
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
