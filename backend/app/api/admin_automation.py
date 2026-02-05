from fastapi import APIRouter
from app.services.auto_ingest import AutoIngestionScheduler

router = APIRouter(prefix="/admin/automation", tags=["admin"])
scheduler = AutoIngestionScheduler()

@router.post("/trigger")
async def trigger_automation():
    """
    Manually triggers the Zero-Touch Automation Pipeline.
    """
    try:
        report = scheduler.run_pipeline()
        return {"status": "success", "report": report}
    except Exception as e:
        return {"status": "error", "message": str(e)}
