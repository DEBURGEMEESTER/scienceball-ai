from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.db import engine
from app.services.data_sync import DataSyncService

router = APIRouter(prefix="/admin", tags=["admin"])
sync_service = DataSyncService()

@router.post("/sync-data")
async def sync_master_data():
    """
    Triggers a live synchronization from the Master DB file (simulating external feed).
    Updates player stats, clubs, and handles transfers based on FM_ID.
    """
    try:
        results = sync_service.sync_database()
        return {"status": "success", "data": results}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
