from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import prospects, outreach, scoring

app = FastAPI(
    title="PulsePoint API",
    description="AI-Powered Sales Outreach Intelligence Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prospects.router, prefix="/api/prospects", tags=["Prospects"])
app.include_router(outreach.router,  prefix="/api/outreach",  tags=["Outreach"])
app.include_router(scoring.router,   prefix="/api/scoring",   tags=["Scoring"])

@app.get("/")
def root():
    return {"message": "PulsePoint API is live 🚀", "team": "Singularity Clutchers"}
