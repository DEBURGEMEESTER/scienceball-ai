from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from app.models.auth import Club, User
from app.core.db import engine
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    access_key: str

@router.post("/login")
async def login(req: LoginRequest):
    with Session(engine) as session:
        # Find club by access key
        club = session.exec(select(Club).where(Club.access_key == req.access_key)).first()
        if not club:
            raise HTTPException(status_code=401, detail="Invalid access key")
        
        # Get or create user
        user = session.exec(select(User).where(User.email == req.email)).first()
        if not user:
            user = User(email=req.email, club_id=club.id)
            session.add(user)
            session.commit()
            session.refresh(user)
        
        # Start trial timer on first login
        if not user.first_login_at:
            user.first_login_at = datetime.now()
            session.add(user)
            session.commit()
            session.refresh(user)
            
        return {
            "user": {
                "email": user.email,
                "first_login": user.first_login_at,
                "expires_at": user.trial_expires_at
            },
            "club": {
                "name": club.name,
                "primary": club.primary_color,
                "secondary": club.secondary_color,
                "accent": club.accent_color,
                "is_admin": club.is_admin
            }
        }

@router.get("/seed")
async def seed_clubs():
    """Seed some test clubs with accurate colors, ensuring admin access"""
    with Session(engine) as session:
        clubs_to_seed = [
            Club(name="Ajax", access_key="amsterdam1900", primary_color="#D2122E", secondary_color="#FFFFFF", accent_color="#C0C0C0"),
            Club(name="Feyenoord", access_key="rotterdam1908", primary_color="#E30613", secondary_color="#FFFFFF", accent_color="#000000"),
            Club(name="ScienceBall Alpha", access_key="tester2026", primary_color="#00f2ff", secondary_color="#7000ff", accent_color="#ff007a"),
            Club(name="ScienceBall HQ", access_key="admin2026", primary_color="#00f2ff", secondary_color="#7000ff", accent_color="#ff007a", is_admin=True),
        ]
        
        seeded_count = 0
        for club_data in clubs_to_seed:
            existing = session.exec(select(Club).where(Club.name == club_data.name)).first()
            if not existing:
                session.add(club_data)
                seeded_count += 1
        
        session.commit()
        return {"msg": f"Seeding complete. Added {seeded_count} new clubs."}
