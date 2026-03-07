"""
backend/app/routes/ai.py
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import sys, os, time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from ml.persona.engine import generate_message
from ml.persona.profiles import assign_persona
from ml.mirror.simulator import simulate_prospect, apply_fix
from ml.research.lead_analyzer import analyze_lead
from ml.channels.linkedin_generator import generate_linkedin_message

router = APIRouter()

signal_log = []

def normalize_lead(data: dict) -> dict:
    if "lead" in data and isinstance(data.get("lead"), dict):
        return data["lead"]
    return {
        "name":        data.get("lead_name", ""),
        "email":       data.get("lead_email", ""),
        "company":     data.get("lead_company", ""),
        "role":        data.get("lead_role", ""),
        "industry":    data.get("lead_industry", ""),
        "linkedin":    data.get("lead_linkedin", ""),
        "pain_points": data.get("pain_points", ""),
    }

def fix_persona(p):
    if not p: return "Arjun"
    return {"arjun":"Arjun","priya":"Priya","dev":"Dev"}.get(p.lower(), p.capitalize())

class GenerateRequest(BaseModel):
    lead_name:     Optional[str] = ""
    lead_company:  Optional[str] = ""
    lead_role:     Optional[str] = ""
    lead_email:    Optional[str] = ""
    lead_industry: Optional[str] = ""
    persona:       Optional[str] = None
    lead:          Optional[dict] = None

class MirrorRequest(BaseModel):
    lead_name:    Optional[str] = ""
    lead_company: Optional[str] = ""
    lead_role:    Optional[str] = ""
    lead_email:   Optional[str] = ""
    message:      str = ""
    lead:         Optional[dict] = None

class FixRequest(BaseModel):
    lead_name:    Optional[str] = ""
    lead_company: Optional[str] = ""
    lead_role:    Optional[str] = ""
    message:      str = ""
    reaction:     Optional[str] = ""
    objection:    Optional[str] = ""
    lead:         Optional[dict] = None

class LinkedInRequest(BaseModel):
    lead_name:    Optional[str] = ""
    lead_role:    Optional[str] = ""
    lead_company: Optional[str] = ""
    lead_email:   Optional[str] = ""
    lead:         Optional[dict] = None

class SignalRequest(BaseModel):
    lead_id:     Optional[str] = ""
    lead_name:   Optional[str] = ""
    signal_type: Optional[str] = "Manual"
    type:        Optional[str] = None

class EnrichRequest(BaseModel):
    lead_name:    Optional[str] = ""
    lead_company: Optional[str] = ""
    lead_role:    Optional[str] = ""
    lead:         Optional[dict] = None

@router.post("/messages/generate")
async def generate_email(req: GenerateRequest):
    lead_dict = normalize_lead(req.dict())
    persona_name = fix_persona(req.persona or assign_persona(lead_dict.get("role", "")))
    result = generate_message(lead_dict, persona_name)
    message_text = result["message"] if isinstance(result, dict) else result
    return {
        "message":      message_text,
        "persona":      result.get("persona", persona_name) if isinstance(result, dict) else persona_name,
        "persona_name": result.get("persona_name", persona_name) if isinstance(result, dict) else persona_name,
        "lead_name":    lead_dict.get("name", ""),
    }

@router.post("/messages/generate-all-personas")
async def generate_all_personas(req: GenerateRequest):
    lead_dict = normalize_lead(req.dict())
    results = {}
    for p in ["Arjun", "Priya", "Dev"]:
        r = generate_message(lead_dict, p)
        results[p] = r["message"] if isinstance(r, dict) else r
    return {"personas": results, "lead_name": lead_dict.get("name", "")}

@router.post("/mirror/simulate")
async def mirror_simulate(req: MirrorRequest):
    lead_dict = normalize_lead(req.dict())
    if not req.message.strip():
        return {"score": 0, "reaction": "No message provided.", "objection": "", "suggested_fix": "", "verdict": "NO MESSAGE"}
    result = simulate_prospect(lead_dict, req.message)
    score = int(result.get("score") or result.get("reply_score") or 50)
    return {
        "score":         score,
        "reaction":      result.get("reaction") or result.get("inner_reaction") or "Simulation complete.",
        "objection":     result.get("objection") or result.get("top_objection") or "",
        "suggested_fix": result.get("suggested_fix") or result.get("fix") or "",
        "verdict":       "WOULD REPLY" if score >= 65 else "WOULD DELETE",
    }

@router.post("/mirror/fix")
async def mirror_fix(req: FixRequest):
    lead_dict = normalize_lead(req.dict())
    fixed = apply_fix(lead_dict, req.message, req.objection)
    if isinstance(fixed, dict):
        fixed = fixed.get("message") or fixed.get("fixed_message") or req.message
    rescore = simulate_prospect(lead_dict, fixed)
    new_score = int(rescore.get("score") or rescore.get("reply_score") or 72)
    return {
        "fixed_message": fixed,
        "message":       fixed,
        "new_score":     new_score,
        "verdict":       "WOULD REPLY" if new_score >= 65 else "WOULD DELETE",
    }

@router.post("/linkedin/draft")
async def linkedin_draft(req: LinkedInRequest):
    lead_dict = normalize_lead(req.dict())
    message = generate_linkedin_message(lead_dict)
    if isinstance(message, dict):
        message = message.get("message", "")
    return {"message": message, "char_count": len(message), "lead_name": lead_dict.get("name", "")}

@router.post("/leads/enrich")
async def enrich_lead(req: EnrichRequest):
    return analyze_lead(normalize_lead(req.dict()))

@router.post("/signals/trigger")
async def trigger_signal(req: SignalRequest):
    sig = req.signal_type or req.type or "Manual"
    name = req.lead_name or req.lead_id or "Unknown"
    event = {
        "id":          len(signal_log) + 1,
        "lead_id":     req.lead_id or name,
        "lead_name":   name,
        "signal_type": sig,
        "timestamp":   time.strftime("%H:%M:%S"),
        "message":     f"{name} - {sig}",
    }
    signal_log.insert(0, event)
    if len(signal_log) > 50:
        signal_log.pop()
    return {"status": "fired", "event": event}

@router.get("/signals/feed")
async def get_signals():
    return {"signals": signal_log}

@router.delete("/signals/clear")
async def clear_signals():
    signal_log.clear()
    return {"status": "cleared"}

@router.get("/leads/all")
async def get_all_leads():
    # Returns empty list if no Firebase — frontend falls back to mock leads
    return []

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    return {"total": 50, "sent": 38, "replied": 8, "avg_score": 74}