from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ProspectRequest(BaseModel):
    linkedin_url: str = None
    github_url: str = None
    website_url: str = None
    name: str = None

@router.post("/analyze")
async def analyze_prospect(req: ProspectRequest):
    """Analyze a prospect's digital footprint and return behavioral profile."""
    # TODO: wire up scraper + NLP pipeline
    return {
        "status": "ok",
        "prospect": req.name,
        "profile": {}
    }

@router.get("/sample")
async def get_sample():
    """Return a sample prospect profile for demo purposes."""
    return {
        "name": "Sample Prospect",
        "tone": "analytical",
        "priorities": ["efficiency", "scalability", "cost-reduction"],
        "pain_points": ["manual processes", "lack of automation"],
        "score": 87
    }
