from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class OutreachRequest(BaseModel):
    prospect_profile: dict
    product_description: str
    sender_name: str
    tone: str = "professional"

@router.post("/generate")
async def generate_message(req: OutreachRequest):
    """Generate a personalized outreach message based on prospect profile."""
    # TODO: wire up message generation engine
    return {
        "status": "ok",
        "message": "",
        "subject_line": "",
        "follow_up_plan": []
    }
