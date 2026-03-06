import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

try:
    from google import genai
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
except Exception:
    client = None


def simulate_prospect(lead: dict, message: str) -> dict:
    """
    Simulate a prospect reading an email and predict their reaction.

    Input:  lead dict + email string
    Output: { reaction, score (0-100), objection, fix }
    """
    prompt = f"""
You are {lead.get('name', 'a prospect')}, a {lead.get('role', 'professional')} at {lead.get('company', 'a company')}.

You just received this cold outreach email:
---
{message}
---

Respond ONLY as valid JSON with these exact keys:
{{
  "reaction": "Your inner monologue as the prospect (1-2 sentences, first person)",
  "score": <integer 0-100 representing likelihood you reply>,
  "objection": "The main reason you might NOT reply (1 sentence)",
  "fix": "One specific improvement that would make you more likely to reply (1 sentence)"
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
            return fallback_simulate(lead, message)
    else:
        return fallback_simulate(lead, message)


def apply_fix(lead: dict, message: str, fix_suggestion: str) -> str:
    """
    Apply a fix suggestion to improve an outreach email.

    Input:  lead dict + original message + fix suggestion
    Output: improved message string
    """
    prompt = f"""
You are rewriting a cold outreach email to make it more effective.

Original email:
---
{message}
---

Prospect details:
- Name: {lead.get('name', 'the prospect')}
- Role: {lead.get('role', 'professional')}
- Company: {lead.get('company', 'their company')}

Specific improvement to apply:
{fix_suggestion}

Rewrite the email applying this improvement. Keep it under 120 words. Return ONLY the rewritten email body.
""".strip()

    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            return response.text.strip()
        except Exception:
            return fallback_simulate(lead, message)["fix"]
    else:
        return fallback_apply(message, fix_suggestion)


def fallback_simulate(lead: dict, message: str) -> dict:
    name = lead.get("name", "the prospect")
    role = lead.get("role", "professional")
    company = lead.get("company", "their company")

    # Score based on message length and personalisation signals
    score = 62
    msg_lower = message.lower()
    if name.split()[0].lower() in msg_lower:
        score += 5
    if company.lower() in msg_lower:
        score += 5
    if len(message) > 300:
        score -= 8  # Too long

    return {
        "reaction": (
            f"This is relevant to what we're dealing with at {company}. "
            f"I'd want to know more before committing to a call, but I'm not deleting this."
        ),
        "score": min(score, 100),
        "objection": f"Needs a more specific hook tailored to {role} challenges at {company}.",
        "fix": f"Open with a specific challenge {role}s at {company}'s stage typically face to immediately establish relevance.",
    }


def fallback_apply(message: str, fix_suggestion: str) -> str:
    # Rebuild the email with a personalised opening that addresses the fix
    lines = message.strip().split("\n")
    # Find the greeting line (starts with Hi/Dear/Hello)
    greeting_index = next(
        (i for i, l in enumerate(lines) if l.strip().lower().startswith(("hi ", "dear ", "hello "))),
        0
    )
    # Insert a strong personalised line right after the greeting
    personal_line = f"I'll cut to the point — {fix_suggestion.rstrip('.')}."
    lines.insert(greeting_index + 1, "")
    lines.insert(greeting_index + 2, personal_line)
    return "\n".join(lines)