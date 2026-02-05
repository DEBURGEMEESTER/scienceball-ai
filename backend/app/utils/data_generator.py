import random
import uuid
from sqlmodel import Session, select
from app.models.player import Player
from app.core.db import engine, init_db

# Constituents for random generation
FIRST_NAMES = ["Luka", "Kylian", "Erling", "Kevin", "Virgil", "Frenkie", "Jude", "Vinicius", "Pedri", "Bukayo", "Jamal", "Gavi", "Xavi", "Mohamed", "Harry", "Bruno", "Bernardo", "Ruben", "Rodri", "Martin", "Marcus", "Phil", "Jack", "Trent", "Reece", "Alphonso", "Achraf", "Theo", "Joao", "Rafael", "Victor", "Enzo", "Julian", "Lautaro", "Federico", "Nicolo", "Sandro", "Alessandro", "Gianluigi", "Matthijs"]
LAST_NAMES = ["Modric", "Mbappe", "Haaland", "De Bruyne", "Van Dijk", "De Jong", "Bellingham", "Junior", "Saka", "Musiala", "Simons", "Salah", "Kane", "Fernandes", "Silva", "Dias", "Odegaard", "Rashford", "Foden", "Grealish", "Alexander-Arnold", "James", "Davies", "Hakimi", "Hernandez", "Cancelo", "Leao", "Osimhen", "Fernandez", "Alvarez", "Martinez", "Chiesa", "Barella", "Tonali", "Bastoni", "Donnarumma", "De Ligt"]
CLUBS = ["Manchester City", "Arsenal", "Liverpool", "Real Madrid", "Barcelona", "Bayern Munich", "PSG", "Inter Milan", "AC Milan", "Juventus", "Napoli", "Atletico Madrid", "Dortmund", "Leipzig", "Ajax", "Benfica", "Porto", "Chelsea", "Man Utd", "Tottenham", "Aston Villa", "Newcastle", "Bayer Leverkusen"]
LEAGUES = ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Eredivisie", "Liga Portugal"]
POSITIONS = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"]

def generate_stats_for_position(position: str, age: int):
    # Base stats dependent on position
    stats = {
        "pace": random.randint(60, 95),
        "shooting": random.randint(40, 90),
        "passing": random.randint(50, 95),
        "dribbling": random.randint(50, 95),
        "defending": random.randint(30, 90),
        "physical": random.randint(50, 90),
        "xg_per_90": 0.0,
        "xa_per_90": 0.0,
        "ppda": 0.0
    }
    
    # Adjustments
    if position in ["CB", "LB", "RB"]:
        stats["defending"] = random.randint(75, 95)
        stats["shooting"] = random.randint(20, 60)
        stats["ppda"] = round(random.uniform(5.0, 15.0), 2)  # Lower is more intense pressing
        stats["xg_per_90"] = round(random.uniform(0.01, 0.1), 2)
    
    elif position in ["CDM", "CM"]:
        stats["passing"] = random.randint(80, 98)
        stats["defending"] = random.randint(60, 85)
        stats["ppda"] = round(random.uniform(6.0, 12.0), 2)
        stats["xa_per_90"] = round(random.uniform(0.1, 0.4), 2)
        
    elif position in ["CAM", "LW", "RW"]:
        stats["dribbling"] = random.randint(80, 98)
        stats["shooting"] = random.randint(70, 90)
        stats["defending"] = random.randint(30, 60)
        stats["xg_per_90"] = round(random.uniform(0.2, 0.5), 2)
        stats["xa_per_90"] = round(random.uniform(0.2, 0.6), 2)
        stats["ppda"] = round(random.uniform(8.0, 18.0), 2) # Forwards press less usually
        
    elif position == "ST":
        stats["shooting"] = random.randint(85, 99)
        stats["defending"] = random.randint(20, 50)
        stats["xg_per_90"] = round(random.uniform(0.4, 1.2), 2)
        stats["xa_per_90"] = round(random.uniform(0.05, 0.25), 2)
        
    return stats

def generate_market_value(age, stats, potential_growth):
    # Rough calc: (Overall capability + potential) * league_modifier
    base = (sum([stats["pace"], stats["shooting"], stats["passing"], stats["dribbling"], stats["defending"], stats["physical"]]) / 6)
    
    value = base * 0.8
    if age < 23: value *= 1.5
    if potential_growth > 5: value *= 1.3
    
    # Random variance
    value = value * random.uniform(0.8, 1.2)
    
    # Format
    if value > 100:
        return f"€{int(value)}M"
    else:
        return f"€{round(value, 1)}M"

def seed_data(target_total: int = 150):
    init_db()
    
    with Session(engine) as session:
        # Count existing real players
        real_count = session.exec(select(Player).where(Player.is_synthetic == False)).all().__len__()
        synthetic_count = session.exec(select(Player).where(Player.is_synthetic == True)).all().__len__()
        
        current_total = real_count + synthetic_count
        
        if current_total >= target_total:
            print(f"Database at capacity ({current_total}/{target_total}). Skipping synthetic generation.")
            return

        to_generate = target_total - current_total
        print(f"Hybrid Seeding Active: {real_count} real, {synthetic_count} synthetic. Generating {to_generate} more to reach {target_total}...")
        
        for _ in range(to_generate):
            pos = random.choice(POSITIONS)
            age = random.randint(17, 34)
            stats = generate_stats_for_position(pos, age)
            predicted_growth = round(random.uniform(0.0, 10.0), 1)
            
            player = Player(
                id=str(uuid.uuid4()),
                name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                club=random.choice(CLUBS),
                league=random.choice(LEAGUES),
                position=pos,
                age=age,
                nationality=random.choice(["France", "Spain", "England", "Brazil", "Argentina", "Germany", "Portugal", "Netherlands", "Italy", "Belgium"]),
                image=f"/placeholder-player-{random.randint(1, 4)}.png",
                market_value=generate_market_value(age, stats, predicted_growth),
                predicted_growth=predicted_growth,
                tactical_role=random.choice(["Playmaker", "Target Man", "Ball Winning Midfielder", "Inverted Winger", "Libero"]),
                is_synthetic=True,
                
                # Stats
                pace=stats["pace"],
                shooting=stats["shooting"],
                passing=stats["passing"],
                dribbling=stats["dribbling"],
                defending=stats["defending"],
                physical=stats["physical"],
                xg_per_90=stats["xg_per_90"],
                xa_per_90=stats["xa_per_90"],
                ppda=stats["ppda"],
                
                # Attributes
                attributes={
                    "technical": [
                        {"name": "Finishing", "value": random.randint(8, 20)},
                        {"name": "Passing", "value": random.randint(8, 20)},
                        {"name": "Dribbling", "value": random.randint(8, 20)},
                        {"name": "Touch", "value": random.randint(8, 20)}
                    ],
                    "mental": [
                        {"name": "Vision", "value": random.randint(8, 20)},
                        {"name": "Positioning", "value": random.randint(8, 20)},
                        {"name": "Determination", "value": random.randint(8, 20)}
                    ],
                    "physical": [
                        {"name": "Pace", "value": random.randint(8, 20)},
                        {"name": "Strength", "value": random.randint(8, 20)},
                        {"name": "Stamina", "value": random.randint(8, 20)}
                    ]
                }
            )
            session.add(player)
            
        session.commit()
        print(f"Hybrid Seeding Complete. Database now contains {target_total} specialized profiles.")

if __name__ == "__main__":
    seed_data()
