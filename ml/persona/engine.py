import os
from dotenv import load_dotenv
from ml.persona.profiles import PERSONAS, assign_persona

load_dotenv("backend/.env")

try:
    import anthropic
    CLAUDE_KEY = os.getenv("ANTHROPIC_API_KEY")
    client = anthropic.Anthropic(api_key=CLAUDE_KEY) if CLAUDE_KEY else None
except:
    client = None


def fallback_message(lead, persona):
    name = lead["name"]
    company = lead["company"]
    role = lead["role"]

    if persona["name"] == "Dev":
        return f"""Hi {name},

Engineering teams at {company} typically face one of two problems: outreach that gets ignored, or automation that feels robotic.

67% of CTOs say they'd respond to outreach that references a specific technical challenge.

Worth 10 minutes to show you what we built?

— Dev"""

    if persona["name"] == "Arjun":
        return f"""Hi {name},

{company} is scaling. Your outreach shouldn't be the bottleneck.

We help teams like yours 3x reply rates in under 2 weeks.

Open to a quick call this week?

— Arjun"""

    return f"""Hi {name},

I came across {company} and wanted to reach out personally.

Many {role}s I speak with mention the same challenge — outreach that feels generic never gets replies.

Would love to share what's been working for teams like yours. No pressure at all.

— Priya"""


def generate_message(lead: dict, objective: str = "schedule a call") -> dict:
    persona_key = lead.get("persona") or assign_persona(lead.get("role", ""))
    persona = PERSONAS[persona_key]

    if client:
        user_prompt = f"""Write a cold outreach email for this lead.

Name: {lead['name']}
Company: {lead['company']}
Role: {lead['role']}
Industry: {lead.get('industry', 'Technology')}
Objective: {objective}

Maximum {persona['max_words']} words. Write ONLY the email body."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            system=persona["system_prompt"],
            messages=[{"role": "user", "content": user_prompt}]
        )
        message = response.content[0].text
    else:
        message = fallback_message(lead, persona)

    return {
        "message": message,
        "persona": persona_key,
        "persona_name": persona["name"],
        "persona_type": persona["type"]
    }