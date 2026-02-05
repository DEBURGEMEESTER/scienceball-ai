from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.db import init_db, seed_data
from app.api import endpoints, players, scouting, shortlists, importer, admin_analytics, chat, negotiations, staff, reports, archive, auth, admin_sync, admin_automation, director
from app.middleware.audit import AuditMiddleware
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_data()
    yield

app = FastAPI(title="ScienceBall.ai API", lifespan=lifespan)

app.add_middleware(AuditMiddleware)

# CORS
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

# Routers
app.include_router(endpoints.router) # Prefix /analytics defined in router
app.include_router(players.router)   # Prefix /players defined in router
app.include_router(scouting.router)  # Prefix /scouting defined in router
app.include_router(shortlists.router) # Prefix /watchlist defined in router
app.include_router(importer.router)   # Prefix /import defined in router
app.include_router(admin_analytics.router) # Prefix /admin/stats defined in router
app.include_router(admin_sync.router)      # Prefix /admin defined in router
app.include_router(admin_automation.router) # Prefix /admin/automation defined in router
app.include_router(chat.router)            # Prefix /chat defined in router
app.include_router(negotiations.router)    # Prefix /negotiations defined in router
app.include_router(staff.router)           # Prefix /staff defined in router
app.include_router(reports.router)         # Prefix /reports defined in router
app.include_router(archive.router)         # Prefix /admin/archive defined in router
app.include_router(auth.router)            # Prefix /auth defined in router
app.include_router(director.router)        # Prefix /director defined in router

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"message": "ScienceBall.ai Global Intelligence Network Online"}
