from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ScoringRequest(BaseModel):
    prospect_profile: dict

@router.post("/score")
async def score_prospect(req: ScoringRequest):
    """Score a prospect's likelihood to respond (0–100)."""
    # TODO: wire up ML scoring model
    return {
        "status": "ok",
        "score": 0,
        "confidence": 0.0,
        "best_send_time": "Tuesday 10AM",
        "reasoning": []
    }
