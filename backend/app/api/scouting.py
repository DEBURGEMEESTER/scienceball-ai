from fastapi import APIRouter
from datetime import datetime
from sqlmodel import Session, select
from app.models.player import Player, ScoutNote, SavedSearch
from app.core.db import engine
from pydantic import BaseModel

router = APIRouter(prefix="/scouting", tags=["scouting"])

@router.get("/feed")
async def get_scouting_feed():
    with Session(engine) as session:
        statement = select(ScoutNote, Player).join(Player).order_by(ScoutNote.id.desc()).limit(15)
        results = session.exec(statement).all()
        
        feed = []
        for note, player in results:
            feed.append({
                "type": "SCOUT_REPORT",
                "player": player.name,
                "player_id": player.id,
                "details": note.note,
                "impact": "MID", # Default impact
                "timestamp": note.date, # In our seed data it's a string YYYY-MM-DD
                "scout": note.scout
            })
            
        return feed

class SavedSearchCreate(BaseModel):
    name: str
    criteria: dict

@router.get("/searches")
async def get_saved_searches():
    with Session(engine) as session:
        searches = session.exec(select(SavedSearch).order_by(SavedSearch.id.desc())).all()
        return searches

@router.post("/searches")
async def create_saved_search(search: SavedSearchCreate):
    with Session(engine) as session:
        db_search = SavedSearch(
            name=search.name,
            criteria=search.criteria,
            date=datetime.now().strftime("%Y-%m-%d")
        )
        session.add(db_search)
        session.commit()
        session.refresh(db_search)
        return db_search

@router.delete("/searches/{search_id}")
async def delete_saved_search(search_id: int):
    with Session(engine) as session:
        search = session.get(SavedSearch, search_id)
        if search:
            session.delete(search)
            session.commit()
            return {"ok": True}
        return {"ok": False}
