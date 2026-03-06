"""
ml/persona/engine.py
Generates outreach emails using Gemini AI with rich fallback.
Supports regeneration — each call produces a fresh unique email.
"""
import os
import random
from dotenv import load_dotenv
from ml.persona.profiles import PERSONAS, assign_persona, get_rich_fallback

load_dotenv("backend/.env")

try:
    from google import genai
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=GEMINI_KEY) if GEMINI_KEY else None
except Exception:
    client = None


def generate_message(lead: dict, objective: str = "schedule a discovery call", seed: int = None) -> dict:
    """
    Generate a personalized outreach email for the given lead.
    
    Args:
        lead: dict with name, company, role, industry, pain_points, hook, approach
        objective: what we want the prospect to do
        seed: optional random seed to force fresh regeneration
    
    Returns:
        dict with message, persona, persona_name, persona_type
    """
    persona_key = lead.get("persona") or assign_persona(lead.get("role", ""))
    persona = PERSONAS[persona_key]

    # Build context from lead's enriched data
    pain_context = ""
    if lead.get("pain_points"):
        pain_context = f"Known pain points: {', '.join(lead['pain_points'][:3])}"

    hook_context = ""
    if lead.get("hook"):
        hook_context = f"Conversation hook to reference: {lead['hook']}"

    approach_context = ""
    if lead.get("approach"):
        approach_context = f"Recommended approach: {lead['approach']}"

    # Add variety seed to force fresh emails on regeneration
    variety_seed = seed or random.randint(1, 999)
    variety_instruction = f"[Variety seed: {variety_seed} — ensure this email feels distinctly different from any previous version]"

    if client:
        try:
            prompt = f"""{persona['system_prompt']}

Lead Details:
Name: {lead['name']}
Company: {lead['company']}
Role: {lead['role']}
Industry: {lead.get('industry', 'Technology')}
{pain_context}
{hook_context}
{approach_context}

Objective: {objective}
Maximum {persona['max_words']} words.
{variety_instruction}

Write ONLY the email body. No subject line. No explanation."""

            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            message = response.text.strip()

        except Exception:
            # Silent fallback — no print, no error shown
            message = get_rich_fallback(lead, persona_key)
    else:
        message = get_rich_fallback(lead, persona_key)

    return {
        "message": message,
        "persona": persona_key,
        "persona_name": persona["name"],
        "persona_type": persona["type"],
    }