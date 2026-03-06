import os
import json
from dotenv import load_dotenv

load_dotenv("backend/.env")

try:
    from google import genai
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=GEMINI_KEY) if GEMINI_KEY else None
except:
    client = None


def fallback_analyze(lead):
    role = lead.get("role", "").lower()
    company = lead.get("company", "")

    if any(k in role for k in ["cto", "engineer", "developer", "technical"]):
        pain_points = ["scaling infrastructure", "technical debt", "team velocity"]
        hook = f"noticed {company} is hiring backend engineers — scaling challenge?"
        score = 72
        approach = "Lead with a technical metric or benchmark"

    elif any(k in role for k in ["ceo", "founder", "president", "vp"]):
        pain_points = ["revenue growth", "operational efficiency", "market competition"]
        hook = f"{company} is growing fast — outreach keeping up?"
        score = 68
        approach = "Lead with business impact and ROI"

    else:
        pain_points = ["team coordination", "process inefficiency", "reporting overhead"]
        hook = f"teams like {company}'s often struggle with manual outreach tracking"
        score = 60
        approach = "Lead with time savings and ease of use"

    return {
        "pain_points": pain_points,
        "hook": hook,
        "score": score,
        "approach": approach
    }


def analyze_lead(lead: dict) -> dict:
    """
    AI enriches a lead with pain points, conversation hook,
    engagement score, and recommended approach.
    """
    if client:
        try:
            prompt = f"""Analyze this sales lead and return insights.

Name: {lead.get('name', '')}
Role: {lead.get('role', '')}
Company: {lead.get('company', '')}
Industry: {lead.get('industry', 'Technology')}

Respond ONLY as valid JSON, no backticks, no other text:
{{
  "pain_points": ["2-3 specific business challenges this person likely faces"],
  "hook": "one specific conversation starter referencing their role or company",
  "score": <integer 0-100 engagement potential>,
  "approach": "recommended outreach angle in one sentence"
}}"""

            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )

            text = response.text.strip()
            if "```" in text:
                text = text.split("```")[1].replace("json", "").strip()

            return json.loads(text)

        except Exception as e:
            print(f"Gemini analyze error ({e.__class__.__name__}), using fallback")
            return fallback_analyze(lead)
    else:
        return fallback_analyze(lead)


def enrich_leads(leads: list) -> list:
    """
    Enriches a list of leads with AI insights.
    Adds pain_points, hook, score, approach to each lead.
    """
    enriched = []
    for lead in leads:
        insights = analyze_lead(lead)
        enriched_lead = {**lead, **insights}
        enriched.append(enriched_lead)
    return enriched