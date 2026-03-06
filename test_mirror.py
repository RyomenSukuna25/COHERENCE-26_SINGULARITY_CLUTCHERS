import sys
sys.path.insert(0, '.')

from ml.persona.engine import generate_message
from ml.mirror.simulator import simulate_prospect, apply_fix

lead = {
    "name": "Rahul Sharma",
    "company": "TechCorp",
    "role": "CTO",
    "persona": "dev"
}

print("STEP 1 — Generating email...")
result = generate_message(lead)
message = result["message"]
print(f"Persona: {result['persona_name']}")
print(f"Email:\n{message}")

print("\n" + "="*50)
print("STEP 2 — MIRROR simulating prospect reaction...")
simulation = simulate_prospect(lead, message)

print(f"\n💭 Inner Reaction: {simulation['reaction']}")
print(f"📊 Reply Score: {simulation['score']}/100")
print(f"❌ Top Objection: {simulation['objection']}")
print(f"⚡ Suggested Fix: {simulation['fix']}")

print("\n" + "="*50)
if simulation["score"] < 60:
    print("STEP 3 — Score too low. Auto-fixing message...")
    improved = apply_fix(lead, message, simulation["fix"])
    print(f"\nImproved Email:\n{improved}")

    print("\nSTEP 4 — Re-simulating with improved message...")
    simulation2 = simulate_prospect(lead, improved)
    print(f"📊 New Reply Score: {simulation2['score']}/100")
    print(f"💭 New Reaction: {simulation2['reaction']}")
else:
    print(f"✅ Score {simulation['score']}/100 — Message approved. Ready to send.")