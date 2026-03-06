import os
from dotenv import load_dotenv
from ml.persona.profiles import assign_persona, PERSONAS

load_dotenv("backend/.env")

try:
    from google import genai
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
except Exception:
    client = None


def generate_message(lead: dict, persona_key: str = None) -> str:
    """
    Generate a personalized outreach email for a lead.
    Returns the message string directly.
    """
    # Normalize persona key — accept Arjun/arjun/ARJUN
    if persona_key:
        persona_key = persona_key.lower()
    else:
        persona_key = lead.get("persona") or assign_persona(lead.get("role", ""))
        if persona_key:
            persona_key = persona_key.lower()

    # Fallback if persona not in profiles
    if persona_key not in PERSONAS:
        persona_key = "arjun"

    persona = PERSONAS[persona_key]

    user_prompt = f"""
Write a professional, personalized cold outreach email to:
- Name: {lead.get('name', 'there')}
- Role: {lead.get('role', 'Professional')}
- Company: {lead.get('company', 'their company')}
- Industry: {lead.get('industry', 'Technology')}
- Known pain points: {lead.get('pain_points', 'scaling outreach efficiently')}

Requirements:
- 180 to 250 words minimum — this must be a FULL professional email, not a one-liner
- Include a compelling opening line specific to their role and company
- Clearly explain the value proposition in 2-3 sentences
- Reference a specific pain point relevant to their role
- End with a clear, low-friction call to action (e.g. "15 minutes this week?")
- Match the persona voice exactly as described in your system prompt
- No subject line. Just the email body starting with "Hi {lead.get('name', 'there')},"
- Sign off with the persona name
""".strip()

    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    {"role": "user", "parts": [{"text": persona["system_prompt"] + "\n\n" + user_prompt}]}
                ]
            )
            return response.text.strip()
        except Exception:
            pass

    return fallback_message(lead, persona_key)


def fallback_message(lead: dict, persona_key: str) -> str:
    name = lead.get("name", "there")
    company = lead.get("company", "your company")
    role = lead.get("role", "your role")

    templates = {
        "arjun": (
            f"Hi {name},\n\n"
            f"I'll be direct — companies like {company} are leaving serious revenue on the table with manual, timer-based outreach. "
            f"Your competitors are already automating personalized sequences that adapt in real-time to prospect behavior.\n\n"
            f"We built a platform that replaces dumb email blasts with behavioral intelligence. "
            f"It simulates how your prospect will react before sending, assigns the right voice for each lead, "
            f"and triggers follow-ups only when the prospect actually does something — not on a fixed timer.\n\n"
            f"Result: our clients see 3x reply rates within the first 30 days. No fluff — I can show you the numbers.\n\n"
            f"As a {role}, you know that pipeline velocity is everything. "
            f"I think 15 minutes could change how your team thinks about outreach entirely.\n\n"
            f"Worth a quick call this week?\n\n"
            f"— Arjun"
        ),
        "priya": (
            f"Hi {name},\n\n"
            f"I came across {company} recently and was genuinely impressed by what your team is building. "
            f"I wanted to reach out personally because I think we might be able to help with something I imagine keeps you up at night.\n\n"
            f"Scaling personalized outreach without losing the human touch is one of the hardest problems in {role} today. "
            f"Most tools automate volume but kill the personal connection — and prospects feel it immediately.\n\n"
            f"We've built something different: an outreach platform that gives each lead a unique voice, "
            f"simulates their reaction before sending, and only follows up when they show genuine interest. "
            f"Teams using it are seeing reply rates they haven't seen since the early days of cold email.\n\n"
            f"I'd love to share how we've helped teams similar to yours — completely no pressure, "
            f"just a genuine conversation to see if there's a fit.\n\n"
            f"Would you be open to a quick 15-minute chat this week?\n\n"
            f"Warm regards,\n— Priya"
        ),
        "dev": (
            f"Hi {name},\n\n"
            f"Quick technical question: how is {company} currently handling outreach sequencing — "
            f"fixed timer delays or behavioral triggers?\n\n"
            f"I ask because the data is pretty clear: timer-based delays reduce deliverability by up to 40% "
            f"and reply rates by 60% compared to behavior-triggered sequences. "
            f"Most {role} teams are still running on the old model without realizing the compounding damage.\n\n"
            f"We built a system that replaces static timers with real behavioral signals — "
            f"it fires the next step only when a prospect opens, clicks, or goes cold. "
            f"It also runs a pre-send simulation to score each message before it leaves your outbox, "
            f"so you never send a weak email again.\n\n"
            f"I can share the architecture and benchmarks if you're curious. "
            f"Happy to do a 15-minute technical walkthrough — no sales pitch, just the actual system.\n\n"
            f"Interested?\n\n"
            f"— Dev"
        ),
    }

    return templates.get(persona_key, templates["priya"])