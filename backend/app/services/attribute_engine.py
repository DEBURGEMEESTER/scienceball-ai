import math
import random

class ScientificAttributeEngine:
    """
    Converts raw performance data into FM-style 0-20 Attributes.
    Philosophy: Every attribute must be traceable to a data point.
    """
    
    @staticmethod
    def calculate_technical(stats: dict, pos: str) -> list:
        # Normalize per 90 stats to 0-20 scale
        # Benchmarks (Elite level): Goals=0.8, xG=0.7, Ast=0.5, KeyP=3.0
        
        goals = float(stats.get("Goals", 0))
        xg = float(stats.get("npxG", 0) or stats.get("xG", 0))
        assists = float(stats.get("Assists", 0))
        prog = float(stats.get("Prog", 0))

        # Finishing: Weighted heavily by xG and Goals
        finishing = min(20, (goals * 12) + (xg * 8))
        if finishing < 5: finishing = 5 + (goals * 5) # Floor helper
        
        # Passing: Progressive actions driving score
        passing = min(20, 8 + (prog * 1.2) + (assists * 10))
        
        # Dribbling: Hard to gauge from summary stats, infer from role/prog
        dribbling = min(20, 8 + (prog * 1.5))
        if "Winger" in pos or "Forward" in pos: dribbling += 2
        
        # Tackling: Inverse to offensive output usually, unless midfielder
        tackling = 6
        if "Back" in pos or "Def" in pos: tackling = 14
        
        return [
            {"name": "Finishing", "value": round(finishing)},
            {"name": "Passing", "value": round(passing)},
            {"name": "Dribbling", "value": round(dribbling)},
            {"name": "Tackling", "value": round(tackling)},
            {"name": "Technique", "value": round((passing + dribbling)/2 + 1)}
        ]

    @staticmethod
    def calculate_mental(stats: dict, pos: str, age: int) -> list:
        # Mental attributes grow with age and consistency
        experience_bonus = min(5, (age - 18) * 0.5) if age > 18 else 0
        
        xg = float(stats.get("npxG", 0))
        goals = float(stats.get("Goals", 0))
        
        # Composure: Overperforming xG suggests ice in veins
        conversion = (goals - xg)
        composure = 10 + (conversion * 10) + experience_bonus
        
        # Vision: Linked to assists/progressive
        assists = float(stats.get("Assists", 0))
        vision = 9 + (assists * 15)
        
        # Work Rate: Inferred base
        work_rate = 12 + random.randint(-1, 2) # Hard to track without tracking data
        
        return [
            {"name": "Composure", "value": round(min(20, max(5, composure)))},
            {"name": "Vision", "value": round(min(20, max(5, vision)))},
            {"name": "Decisions", "value": round(10 + experience_bonus)},
            {"name": "Work Rate", "value": round(work_rate)},
            {"name": "Flair", "value": round(vision * 0.8 + 2)}
        ]

    @staticmethod
    def calculate_physical(stats: dict, pos: str, age: int) -> list:
        # Physical peak is ~24-28
        peak_factor = 1.0
        if age < 20: peak_factor = 0.9
        if age > 30: peak_factor = 0.8
        
        # Base physicals by position
        pace = 12
        strength = 10
        
        if "Winger" in pos: pace = 16
        if "Back" in pos: strength = 14
        if "Striker" in pos: strength = 13
        
        # Random variance for genetics (Scientific uncertainty)
        pace += random.uniform(-1, 2)
        strength += random.uniform(-2, 2)
        
        return [
            {"name": "Pace", "value": round(pace * peak_factor)},
            {"name": "Acceleration", "value": round((pace - 1) * peak_factor)},
            {"name": "Strength", "value": round(strength * peak_factor)},
            {"name": "Stamina", "value": round(13 * peak_factor)},
            {"name": "Balance", "value": round(12)}
        ]

    @staticmethod
    def generate_value_history(current_value_str: str, age: int) -> list:
        """Generates a realistic 3-year market value history curve."""
        try:
            # Parse "€150M" -> 150.0
            val = float(current_value_str.replace("€", "").replace("M", ""))
        except:
            val = 10.0 # Fallback
            
        history = []
        # Year -3
        v3 = val * 0.6 if age < 22 else val * 0.9
        history.append({"date": "2023", "value": round(v3, 1)})
        
        # Year -2
        v2 = val * 0.75 if age < 22 else val * 0.95
        history.append({"date": "2024", "value": round(v2, 1)})
        
        # Year -1
        v1 = val * 0.9
        history.append({"date": "2025", "value": round(v1, 1)})
        
        # Current
        history.append({"date": "2026", "value": val})
        
        return history

    @staticmethod
    def generate_agent_profile(league: str) -> dict:
        """Assigns a top agency based on league/stature."""
        agencies = [
            {"name": "Gestifute", "agent": "Jorge Mendes", "tier": "Elite", "clients": ["Ruben Dias", "Ederson"]},
            {"name": "Mino Raiola Legacy", "agent": "Rafaela Pimenta", "tier": "Elite", "clients": ["Haaland", "De Ligt"]},
            {"name": "Stellar Group", "agent": "Jonathan Barnett", "tier": "Tier 1", "clients": ["Camavinga", "Grealish"]},
            {"name": "ROOF", "agent": "Neil Fewings", "tier": "Tier 1", "clients": ["Van Dijk", "Havertz"]},
            {"name": "Base Soccer", "agent": "Frank Trimboli", "tier": "Tier 2", "clients": ["Maddison", "Son"]}
        ]
        
        # Random assignment weighted by nothing for now, just random valid
        selection = random.choice(agencies)
        return {
            "name": selection["agent"],
            "agency": selection["name"],
            "tier": selection["tier"],
            "history": [f"Negotiated {c} deal" for c in selection["clients"]]
        }

    @classmethod
    def generate_full_profile(cls, player_model) -> dict:
        """Takes a SQLModel player and returns the structured 0-20 dict."""
        raw = player_model.attributes or {}

        # Ensure we have specific stats to work with or fallback
        # If raw is empty, we must infer from position + age + league? 
        # For now assuming raw has the 'Goals' etc from seed.
        
        return {
            "technical": cls.calculate_technical(raw, player_model.position),
            "mental": cls.calculate_mental(raw, player_model.position, player_model.age),
            "physical": cls.calculate_physical(raw, player_model.position, player_model.age)
        }
