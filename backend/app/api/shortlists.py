from app.models.player import Player, Shortlist, ShortlistPlayerLink
from app.core.db import engine
from typing import List, Dict
from fastapi import APIRouter
from sqlmodel import Session, select

router = APIRouter(prefix="/watchlist", tags=["shortlists"])

def _get_full_watchlist(session: Session) -> Dict[str, List[str]]:
    """Helper to return the structured shortlist DB from SQL."""
    shortlists = session.exec(select(Shortlist)).all()
    result = {}
    for s in shortlists:
        result[s.name] = [player.id for player in s.players]
    return result

@router.get("")
async def get_watchlist():
    with Session(engine) as session:
        return _get_full_watchlist(session)

@router.post("/category")
async def create_category(name: str):
    with Session(engine) as session:
        existing = session.exec(select(Shortlist).where(Shortlist.name == name)).first()
        if not existing:
            new_s = Shortlist(name=name)
            session.add(new_s)
            session.commit()
        return {"status": "success", "watchlist": _get_full_watchlist(session)}

@router.delete("/category/{name}")
async def delete_category(name: str):
    with Session(engine) as session:
        shortlist = session.exec(select(Shortlist).where(Shortlist.name == name)).first()
        if shortlist:
            session.delete(shortlist)
            session.commit()
        return {"status": "success", "watchlist": _get_full_watchlist(session)}

@router.post("/{category}/{player_id}")
async def add_to_watchlist(category: str, player_id: str):
    with Session(engine) as session:
        shortlist = session.exec(select(Shortlist).where(Shortlist.name == category)).first()
        if not shortlist:
            shortlist = Shortlist(name=category)
            session.add(shortlist)
            session.commit()
            session.refresh(shortlist)
        
        # Check if link exists
        link = session.exec(select(ShortlistPlayerLink).where(
            ShortlistPlayerLink.shortlist_id == shortlist.id,
            ShortlistPlayerLink.player_id == player_id
        )).first()
        
        if not link:
            new_link = ShortlistPlayerLink(shortlist_id=shortlist.id, player_id=player_id)
            session.add(new_link)
            session.commit()
            
        return {"status": "success", "watchlist": _get_full_watchlist(session)}

@router.delete("/{category}/{player_id}")
async def remove_from_watchlist(category: str, player_id: str):
    with Session(engine) as session:
        shortlist = session.exec(select(Shortlist).where(Shortlist.name == category)).first()
        if shortlist:
            link = session.exec(select(ShortlistPlayerLink).where(
                ShortlistPlayerLink.shortlist_id == shortlist.id,
                ShortlistPlayerLink.player_id == player_id
            )).first()
            if link:
                session.delete(link)
                session.commit()
                
        return {"status": "success", "watchlist": _get_full_watchlist(session)}
