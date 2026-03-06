import os
from dotenv import load_dotenv
from ml.persona.profiles import PERSONAS, assign_persona

load_dotenv("backend/.env")

try:
    from google import genai
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=GEMINI_KEY) if GEMINI_KEY else None
except:
    client = None


def fallback_linkedin(lead: dict, persona_key: str) -> str:
    first = lead["name"].split()[0]
    company = lead["company"]
    if persona_key == "arjun":
        return f"Hey {first}, sent you an email about {company} last week. Worth a quick chat?"
    if persona_key == "dev":
        return f"Hi {first}, reached out via email re: {company}'s outreach stack. Open to connect?"
    return f"Hi {first}, I emailed you recently. Would love to connect here too — no pressure at all."


def generate_linkedin_message(lead: dict, email_context: str = "") -> dict:
    """
    Generates a short casual LinkedIn follow-up message.
    Used when email goes cold after 3+ days.
    Max 200 characters. Casual tone. Not salesy.
    """
    persona_key = lead.get("persona") or assign_persona(lead.get("role", ""))
    persona = PERSONAS[persona_key]

    if client:
        try:
            prompt = f"""Write a SHORT LinkedIn follow-up message.
Recipient: {lead['name']}, {lead['role']} at {lead['company']}
Situation: Already sent them a cold email that went unanswered for 3 days.
Persona style: {persona['name']} — {persona['type']}
Rules:
- MAX 200 characters total
- Casual and warm — NOT salesy
- Reference the previous email briefly
- End with a soft question
- No subject line, no sign-off, just the message
Return ONLY the message text, nothing else."""

            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            message = response.text.strip()

            # Enforce 200 char limit
            if len(message) > 200:
                message = message[:197] + "..."

        except:
            message = fallback_linkedin(lead, persona_key)
    else:
        message = fallback_linkedin(lead, persona_key)

    return {
        "message": message,
        "channel": "linkedin",
        "persona": persona_key,
        "persona_name": persona["name"],
        "lead_name": lead["name"],
        "char_count": len(message)
    }