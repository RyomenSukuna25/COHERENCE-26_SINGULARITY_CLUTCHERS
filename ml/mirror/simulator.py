import os
import json
from dotenv import load_dotenv
from ml.persona.profiles import PERSONAS

load_dotenv("backend/.env")

try:
    from google import genai
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=GEMINI_KEY) if GEMINI_KEY else None
except:
    client = None


def fallback_simulate(lead, message):
    """Used when Gemini is unavailable"""
    score = 45
    if lead["name"].lower() in message.lower():
        score += 15
    if lead["company"].lower() in message.lower():
        score += 15
    if len(message) < 200:
        score += 10

    return {
        "reaction": f"This email mentions {lead['company']} which caught my attention, but it still feels slightly generic.",
        "score": score,
        "objection": "Unclear what specific value this brings to my situation.",
        "fix": f"Reference a specific challenge that {lead['role']}s at {lead['company']} face right now."
    }


def simulate_prospect(lead: dict, message: str) -> dict:
    """
    Simulates a prospect reading the outreach message.
    Returns their inner reaction, reply score, top objection, and suggested fix.
    """
    if client:
        try:
            prompt = f"""You are {lead['name']}, {lead['role']} at {lead['company']}.
You are extremely busy. You receive 50+ cold emails every day.
You are skeptical of sales outreach.

You just read this cold email:
---
{message}
---

Respond ONLY as valid JSON, no other text, no backticks:
{{
  "reaction": "your honest inner thought in 1-2 sentences as this person",
  "score": <integer 0-100, your likelihood to reply>,
  "objection": "the single main reason you might NOT reply",
  "fix": "one specific change that would make you more likely to reply"
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
            print(f"Gemini mirror error ({e.__class__.__name__}), using fallback")
            return fallback_simulate(lead, message)
    else:
        return fallback_simulate(lead, message)


def apply_fix(lead: dict, message: str, fix_suggestion: str) -> str:
    """
    Rewrites the message applying the suggested fix.
    """
    if client:
        try:
            prompt = f"""Rewrite this cold outreach email applying exactly this improvement:
{fix_suggestion}

Recipient: {lead['name']}, {lead['role']} at {lead['company']}

Original email:
{message}

Return ONLY the improved email body. No subject line. No explanation."""

            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            return response.text.strip()

        except Exception as e:
            print(f"Gemini fix error ({e.__class__.__name__}), returning original")
            return message
    else:
        return message