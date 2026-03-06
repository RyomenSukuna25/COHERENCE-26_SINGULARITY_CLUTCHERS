import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

try:
    from google import genai
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
except Exception:
    client = None


def analyze_lead(lead: dict) -> dict:
    """
    AI-powered lead analysis for personalized outreach hooks.

    Input:  lead dict { name, role, company, industry }
    Output: { pain_points, hook, score, approach }
    """
    prompt = f"""
Analyze this sales lead and return outreach intelligence.

Lead:
- Name: {lead.get('name', 'Unknown')}
- Role: {lead.get('role', 'Unknown')}
- Company: {lead.get('company', 'Unknown')}
- Industry: {lead.get('industry', 'Unknown')}

Respond ONLY as valid JSON with these exact keys:
{{
  "pain_points": ["pain point 1", "pain point 2", "pain point 3"],
  "hook": "A single compelling opening line tailored to this lead",
  "score": <integer 0-100 representing lead quality / likelihood to convert>,
  "approach": "Brief recommended outreach strategy (1-2 sentences)"
}}
""".strip()

    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            import json
            text = response.text.strip()
            # Strip markdown fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text.strip())
        except Exception:
            return fallback_analyze(lead)
    else:
        return fallback_analyze(lead)


def enrich_leads(leads_list: list) -> list:
    """
    Enrich a list of leads with AI insights.

    Input:  list of lead dicts
    Output: same list with hook, pain_points, score, approach merged directly onto each lead
    """
    enriched = []
    for lead in leads_list:
        insights = analyze_lead(lead)
        # Flatten insights directly onto the lead so tests can access lead['hook'] etc.
        enriched_lead = {**lead, **insights}
        enriched.append(enriched_lead)
    return enriched


def fallback_analyze(lead: dict) -> dict:
    role = lead.get("role", "professional").lower()
    company = lead.get("company", "their company")
    industry = lead.get("industry", "their industry")

    # Role-based fallback pain points
    if any(k in role for k in ["ceo", "founder", "owner"]):
        pain_points = [
            "Scaling outreach without growing headcount",
            "Maintaining pipeline consistency across the team",
            "Differentiating from competitors on limited budget",
        ]
        approach = "Lead with ROI and time-to-value. CEOs respond to numbers, not features."
        score = 72
    elif any(k in role for k in ["cto", "tech", "engineer", "developer"]):
        pain_points = [
            "Integration complexity with existing tools",
            "Data quality and deliverability issues",
            "Automating repetitive outreach workflows",
        ]
        approach = "Lead with technical depth and API flexibility. Show how it fits their stack."
        score = 65
    elif any(k in role for k in ["hr", "people", "recruit", "talent"]):
        pain_points = [
            "Reaching passive candidates at scale",
            "Personalizing outreach across high volume",
            "Tracking engagement without manual follow-up",
        ]
        approach = "Lead with empathy and relationship-building. Nurture-first approach works best."
        score = 68
    else:
        pain_points = [
            f"Scaling personalized outreach at {company}",
            "Low reply rates on standard email campaigns",
            "Time spent on manual follow-ups",
        ]
        approach = f"Research {company}'s recent activity and lead with a relevant, timely hook."
        score = 60

    return {
        "pain_points": pain_points,
        "hook": f"I noticed {company} is growing fast in {industry} — most teams at your stage hit a wall with outreach. Here's how we fix that.",
        "score": score,
        "approach": approach,
    }