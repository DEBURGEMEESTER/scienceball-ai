from fastapi import APIRouter, Depends
from typing import List
from app.services.director_intel import DirectorIntelService
import asyncio

router = APIRouter(prefix="/director", tags=["director"])
service = DirectorIntelService()

@router.get("/priority-targets")
async def get_priority_targets():
    """
    Returns specific transfer targets based on current squad gaps.
    Algorithm: Analyze Squad -> Identify Gaps -> Search DB for fits.
    """
    return service.get_priority_targets()

@router.get("/squad-health")
async def get_squad_health():
    """
    Returns the analysis of the current squad composition.
    """
    return service.analyze_squad_health("Ajax")
