from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as analytics_router
from app.api.players import router as players_router
from app.api.scouting import router as scouting_router
from app.api.shortlists import router as shortlists_router
from app.api.importer import router as importer_router

app = FastAPI(
    title="ScienceBall.ai Intelligence Engine",
    description="Advanced analytics and predictive modeling for football scouting.",
    version="0.1.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(analytics_router)
app.include_router(players_router)
app.include_router(scouting_router)
app.include_router(shortlists_router)
app.include_router(importer_router)

from app.core.db import init_db, seed_data

@app.on_event("startup")
def on_startup():
    init_db()
    seed_data()

@app.get("/")
async def root():
    return {
        "message": "ScienceBall.ai Intelligence Engine Online",
        "capabilities": ["Expected Threat (xT)", "Possession Value", "Packaging Rates"],
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

