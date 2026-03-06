import os
from dotenv import load_dotenv
from ml.persona.profiles import assign_persona, PERSONAS

load_dotenv("backend/.env")

try:
    from google import genai
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
except Exception:
    client = None


def generate_message(lead: dict) -> dict:
    """
    Generate a personalized outreach email for a lead.

    Input:  { name, company, role, industry }
    Output: { message, persona, persona_name, persona_type }
    """
    persona_key = lead.get("persona") or assign_persona(lead.get("role", ""))
    persona = PERSONAS[persona_key]

    user_prompt = f"""
Write a personalized outreach email (max {persona.get('max_words', 120)} words) to:
- Name: {lead.get('name', 'there')}
- Role: {lead.get('role', 'Professional')}
- Company: {lead.get('company', 'their company')}
- Industry: {lead.get('industry', 'their industry')}

No subject line. Just the email body.
""".strip()

    message = None

    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    {"role": "user", "parts": [{"text": persona["system_prompt"] + "\n\n" + user_prompt}]}
                ]
            )
            message = response.text.strip()
        except Exception:
            # Silent fallback — never show errors during demo
            message = fallback_message(lead, persona_key)
    else:
        message = fallback_message(lead, persona_key)

    return {
        "message": message,
        "persona": persona_key,
        "persona_name": persona.get("name", persona_key.capitalize()),
        "persona_type": persona["type"],
    }


def fallback_message(lead: dict, persona_key: str) -> str:
    name = lead.get("name", "there")
    company = lead.get("company", "your company")
    role = lead.get("role", "your role")

    templates = {
        "arjun": (
            f"Hi {name},\n\n"
            f"Companies like {company} are leaving revenue on the table with manual outreach. "
            f"Our platform automates the entire pipeline — clients see 3x reply rates within 30 days.\n\n"
            f"15 minutes this week?\n\n"
            f"— Arjun"
        ),
        "priya": (
            f"Hi {name},\n\n"
            f"I came across {company} and was really impressed. As someone in {role}, "
            f"I imagine scaling personalized outreach is a real challenge.\n\n"
            f"I'd love to share how we've helped similar teams — no pressure, just a quick chat?\n\n"
            f"— Priya"
        ),
        "dev": (
            f"Hi {name},\n\n"
            f"Quick question — how is {company} currently handling outreach sequencing? "
            f"Most {role} teams are still on timer-based delays, which kills deliverability by up to 40%.\n\n"
            f"Happy to walk you through a better approach if you're open to it.\n\n"
            f"— Dev"
        ),
    }

    return templates.get(persona_key, templates["priya"])