from fastapi import APIRouter, HTTPException
from typing import List, Optional
from sqlmodel import Session, select
from app.models.chat import Channel, Message
from app.core.db import engine
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["chat"])

class MessageCreate(BaseModel):
    channel_id: int
    sender: str
    content: str
    player_id: Optional[str] = None

@router.get("/channels", response_model=List[Channel])
async def get_channels():
    with Session(engine) as session:
        channels = session.exec(select(Channel)).all()
        
        # Seed default channels if empty
        if not channels:
            internal = Channel(name="Staff Hub", type="INTERNAL")
            network = Channel(name="Director Network", type="DIRECTOR_NETWORK")
            support = Channel(name="Alpha Feedback (Dev)", type="SUPPORT")
            session.add(internal)
            session.add(network)
            session.add(support)
            session.commit()
            session.refresh(internal)
            session.refresh(network)
            session.refresh(support)
            channels = [internal, network, support]
            
        return channels

@router.get("/messages/{channel_id}", response_model=List[Message])
async def get_messages(channel_id: int):
    with Session(engine) as session:
        statement = select(Message).where(Message.channel_id == channel_id).order_by(Message.timestamp.asc())
        results = session.exec(statement).all()
        return results

@router.post("/messages", response_model=Message)
async def send_message(msg: MessageCreate):
    with Session(engine) as session:
        db_msg = Message(
            channel_id=msg.channel_id,
            sender=msg.sender,
            content=msg.content,
            player_id=msg.player_id,
            timestamp=datetime.now()
        )
        session.add(db_msg)
        session.commit()
        session.refresh(db_msg)
        return db_msg
