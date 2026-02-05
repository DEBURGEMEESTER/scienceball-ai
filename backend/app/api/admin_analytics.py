from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.core.db import get_session
from app.models.player import Player
from app.utils.data_generator import seed_data
import time

router = APIRouter(prefix="/admin/stats", tags=["admin"])

@router.get("/health")
async def get_data_health(session: Session = Depends(get_session)):
    real_count = session.exec(select(func.count(Player.id)).where(Player.is_synthetic == False)).one()
    synthetic_count = session.exec(select(func.count(Player.id)).where(Player.is_synthetic == True)).one()
    
    total = real_count + synthetic_count
    ratio = (real_count / total * 100) if total > 0 else 0
    
    return {
        "real_count": real_count,
        "synthetic_count": synthetic_count,
        "total": total,
        "real_data_ratio": round(ratio, 1),
        "status": "OPTIMAL" if ratio > 20 else "LOW_REALISM"
    }

@router.post("/regenerate")
async def trigger_regeneration():
    start_time = time.time()
    seed_data(target_total=200)
    end_time = time.time()
    
    return {
        "status": "success",
        "message": "Synthetic signals synchronized.",
        "duration_ms": int((end_time - start_time) * 1000)
    }
