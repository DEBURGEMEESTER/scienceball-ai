from typing import List, Dict, Any
from sqlmodel import Session, select
from app.models.player import Player
from app.core.db import engine
import random

class DirectorIntelService:
    """
    Service to provide Director-Level intelligence, specifically identifying
    Strategic Gaps in the squad to drive recruitment.
    """
    
    REQUIRED_Roles = {
        "GK": 2,
        "RB": 2,
        "LB": 2,
        "CB": 4,
        "DM": 2,
        "CM": 2,
        "CAM": 1,
        "RW": 2,
        "LW": 2,
        "ST": 2
    }
    
    def analyze_squad_health(self, club: str = "Ajax") -> Dict[str, Any]:
        with Session(engine) as session:
            # Fetch all squad players
            statement = select(Player).where(Player.club == club)
            squad = session.exec(statement).all()
            
            roster_map = {role: [] for role in self.REQUIRED_Roles.keys()}
            
            for p in squad:
                # Naive position mapping
                pos = p.position.upper()
                if pos in roster_map:
                    roster_map[pos].append(p)
                elif "/" in pos:
                    # Handle "LCB/LB" -> LCB (mapped to CB)
                    main_pos = pos.split("/")[0]
                    if "CB" in main_pos: main_pos = "CB"
                    if main_pos in roster_map:
                        roster_map[main_pos].append(p)
                        
            # Identify Gaps
            gaps = []
            for role, required in self.REQUIRED_Roles.items():
                current = len(roster_map[role])
                if current < required:
                    gaps.append({
                        "role": role,
                        "current": current,
                        "required": required,
                        "severity": "CRITICAL" if current == 0 else "HIGH"
                    })
                    
            return {
                "club": club,
                "squad_size": len(squad),
                "gaps": gaps,
                "health_score": max(0, 100 - (len(gaps) * 15))
            }

    def get_priority_targets(self, limit: int = 5) -> List[Dict]:
        """
        Fetches transfer targets that specifically fill the identified gaps.
        """
        analysis = self.analyze_squad_health("Ajax")
        gaps = analysis["gaps"]
        
        if not gaps:
            # Fallback if no gaps: Just get high potential young players
            with Session(engine) as session:
                statement = select(Player).where(Player.age <= 23).order_by(Player.predicted_growth.desc()).limit(limit)
                results = session.exec(statement).all()
                return [self._enrich_target(p, "Elite Talent") for p in results]

        # Strategic Search for Gaps
        targets = []
        with Session(engine) as session:
            for gap in gaps:
                role = gap["role"]
                # Find players of this position, NOT in our club, High Potential
                statement = select(Player).where(
                    Player.position == role,
                    Player.club != "Ajax",
                    Player.age <= 25  # Director preference: Young/Prime
                ).order_by(Player.metrics.desc()) # Naive "best" sort - simplified
                
                # We need a proper sort. Let's sort by market_value as proxy for quality for now
                # Or better: random valid choice to simulate scouting variety
                candidates = session.exec(statement).all()
                
                # Filter strictly by complexity if needed? No, just pick top 1-2
                candidates = sorted(candidates, key=lambda x: x.predicted_growth, reverse=True)[:2]
                
                for c in candidates:
                    targets.append(self._enrich_target(c, f"Direct Replacement: {role}"))
                    
        return targets[:limit]

    def _enrich_target(self, player: Player, reason: str) -> Dict:
        """Adds DNA Context to the player object."""
        result = player.model_dump(exclude={"attributes", "metrics", "medical_dna", "physical_metrics", "cognitive_profile", "biometric_profile", "scientific_dossier"})
        result["recruitment_reason"] = reason
        result["match_score"] = random.randint(88, 99) # Simulated "System Fit"
        return result
