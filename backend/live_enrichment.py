import random
from datetime import datetime, timedelta
from app.core.db import engine
from app.models.player import Player, ShortlistPlayerLink
from app.models.negotiation import Negotiation
from app.models.staff import StaffMember, Assignment
from app.models.chat import Message
from sqlmodel import Session, select

def enrich_portal():
    print("🧪 Starting Operation Living Portal: Vitalizing Intelligence Networks...")
    
    with Session(engine) as session:
        # 1. Staff Enrichment
        try:
            print("👤 Checking technical department status...")
            staff = session.exec(select(StaffMember)).all()
            if not staff:
                print("   > Seeding technical department...")
                s1 = StaffMember(name="Erik ten Hag", role="DIRECTOR", specialization="System Tactics")
                s2 = StaffMember(name="Piet de Visser", role="CHIEF_SCOUT", specialization="South American Talent")
                s3 = StaffMember(name="Lead Analyst", role="ANALYST", specialization="Expected Threat Models")
                session.add_all([s1, s2, s3])
                session.commit()
                staff = [s1, s2, s3]
            print(f"   > {len(staff)} staff members active.")
        except Exception as e:
            print(f"   ❌ Staff Enrichment Failed: {e}")

        # 2. Player Intelligence (Contracts)
        try:
            players = session.exec(select(Player)).all()
            print(f"📈 Updating {len(players)} dossiers with contract metadata...")
            for p in players:
                if random.random() < 0.2:
                    p.contract_expiry = "2025-06-30"
                elif random.random() < 0.3:
                    p.contract_expiry = "2026-06-30"
                else:
                    p.contract_expiry = "2028-06-30"
                session.add(p)
            session.commit()
            print("   > Contract risks synchronized.")
        except Exception as e:
            print(f"   ❌ Player Contract Enrichment Failed: {e}")

        # 3. Shortlist Pulse
        try:
            print("★ Synchronizing shortlist pulse...")
            players = session.exec(select(Player)).all()
            elite_targets = players[:8]
            for p in elite_targets:
                existing = session.exec(select(ShortlistPlayerLink).where(ShortlistPlayerLink.player_id == p.id)).first()
                if not existing:
                    link = ShortlistPlayerLink(player_id=p.id, shortlist_name="Elite Prospects")
                    session.add(link)
            session.commit()
            print(f"   > {len(elite_targets)} targets integrated into pipelines.")
        except Exception as e:
            print(f"   ❌ Shortlist Pulse Failed: {e}")

        # 4. Recruitment Pipeline
        try:
            print("💶 Simulating active negotiations...")
            players = session.exec(select(Player)).all()
            elite_targets = players[:8]
            for p in elite_targets[3:6]:
                existing_neg = session.exec(select(Negotiation).where(Negotiation.player_id == p.id)).first()
                if not existing_neg:
                    # Robust Value Parsing
                    mv = str(p.market_value or "€1.0M")
                    mv_clean = "".join(c for c in mv if c.isdigit() or c == '.')
                    try:
                        val = float(mv_clean) if mv_clean else 1.0
                    except:
                        val = 1.0
                    
                    neg = Negotiation(
                        player_id=p.id,
                        status=random.choice(["INQUIRY", "VERBAL", "MEDICAL"]),
                        estimated_fee=val * 1000000,
                        notes=f"Strategic alignment detected. {p.club} open to structured buyout."
                    )
                    session.add(neg)
            session.commit()
            print("   > Recruitment pipelines active.")
        except Exception as e:
            print(f"   ❌ Pipeline Enrichment Failed: {e}")

        # 5. Global Activity Log
        try:
            print("💬 Generating global activity log...")
            staff = session.exec(select(StaffMember)).all()
            players = session.exec(select(Player)).all()
            if staff and players:
                for _ in range(10):
                    p = random.choice(players)
                    s = random.choice(staff)
                    
                    msg = Message(
                        sender=s.name,
                        content=f"Intelligence review complete for {p.name}. Profile alignment is high.",
                        player_id=p.id,
                        timestamp=datetime.now() - timedelta(hours=random.randint(1, 48))
                    )
                    session.add(msg)
                    
                    assign = Assignment(
                        player_id=p.id,
                        staff_id=s.id,
                        status="IN_PROGRESS",
                        priority="HIGH",
                        notes="Initiate deep-dive tactical profile analysis.",
                        created_at=datetime.now() - timedelta(days=random.randint(1, 5))
                    )
                    session.add(assign)
                session.commit()
                print("   > Activity log synchronized.")
        except Exception as e:
            print(f"   ❌ Activity Log Enrichment Failed: {e}")

        print("🚀 Mission Accomplished: Portal Vitalization Complete.")

if __name__ == "__main__":
    enrich_portal()
