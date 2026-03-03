"""
Message Generator — Generates hyper-personalized outreach messages.
Uses prospect profile to tailor tone, content, and call-to-action.
"""

TEMPLATES = {
    "analytical": "Hi {name}, I noticed {insight}. Given your focus on {priority}, I thought {product} could help with {pain_point}.",
    "visionary":  "Hi {name}, {insight} tells me you're thinking big. {product} is built for leaders like you who want to {priority}.",
    "casual":     "Hey {name}! Saw {insight} and had to reach out — {product} is exactly what teams tackling {pain_point} need.",
}

def generate_message(profile: dict, product: str, sender: str) -> dict:
    """
    Generate a personalized outreach message based on prospect profile.
    """
    tone = profile.get("tone", "analytical")
    template = TEMPLATES.get(tone, TEMPLATES["analytical"])
    
    # TODO: replace with LLM-powered generation
    message = template.format(
        name=profile.get("name", "there"),
        insight="[prospect insight]",
        priority=profile.get("priorities", ["efficiency"])[0] if profile.get("priorities") else "growth",
        product=product,
        pain_point=profile.get("pain_points", ["manual work"])[0] if profile.get("pain_points") else "this challenge"
    )
    
    return {
        "subject": generate_subject(profile, product),
        "body": message,
        "follow_ups": generate_followups(profile)
    }

def generate_subject(profile: dict, product: str) -> str:
    return f"Quick thought for {profile.get('name', 'you')}"

def generate_followups(profile: dict) -> list:
    return [
        {"day": 3,  "message": "Following up on my previous message..."},
        {"day": 7,  "message": "One last thought before I leave you alone..."},
    ]
