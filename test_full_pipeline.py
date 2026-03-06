import sys
sys.path.insert(0, '.')

from ml.research.lead_analyzer import enrich_leads
from ml.persona.engine import generate_message
from ml.mirror.scorer import score_message
from ml.simulation.behavior import simulate_day_schedule, should_send_now

print("⚡ NEXUS v2 — FULL ML PIPELINE TEST")
print("="*60)

# RAW LEADS (as if uploaded from Excel)
raw_leads = [
    {"name": "Rahul Sharma", "company": "TechCorp", "role": "CTO"},
    {"name": "Priya Mehta", "company": "StartupXYZ", "role": "HR Manager"},
    {"name": "Arjun Singh", "company": "ScaleUp Inc", "role": "CEO"},
]

# STEP 1 — ENRICH LEADS
print("\n📊 STEP 1 — AI Lead Enrichment")
print("-"*60)
enriched = enrich_leads(raw_leads)
for lead in enriched:
    print(f"✅ {lead['name']} | Score: {lead['score']}/100 | Hook: {lead['hook']}")

# STEP 2 — GENERATE MESSAGES
print("\n✉️  STEP 2 — PERSONA Message Generation")
print("-"*60)
messages = []
for lead in enriched:
    result = generate_message(lead)
    messages.append({"lead": lead, "message": result["message"], "persona": result["persona_name"]})
    print(f"✅ {lead['name']} → Persona: {result['persona_name']}")
    print(f"   Preview: {result['message'][:80].strip()}...")

# STEP 3 — MIRROR SCORING
print("\n🪞 STEP 3 — MIRROR Score Gate")
print("-"*60)
approved = []
for item in messages:
    result = score_message(item["lead"], item["message"], threshold=60)
    status = "✅ APPROVED" if result["approved"] else "❌ BLOCKED"
    print(f"{status} | {item['lead']['name']} | Score: {result['score']}/100 | Attempts: {result['attempts']}")
    if result["approved"]:
        approved.append({"lead": item["lead"], "message": result["final_message"]})

# STEP 4 — BEHAVIOR SCHEDULE
print(f"\n⏰ STEP 4 — Send Schedule ({len(approved)} approved messages)")
print("-"*60)
schedule = simulate_day_schedule(len(approved))
for i, slot in enumerate(schedule):
    lead_name = approved[i]["lead"]["name"] if i < len(approved) else "?"
    print(f"📧 {lead_name} → {slot['send_hour']:02d}:{slot['send_minute']:02d} | Energy: {slot['energy_level']} | Typing: {slot['typing_delay']}s")

# SUMMARY
print("\n" + "="*60)
print("📊 PIPELINE SUMMARY")
print(f"   Leads uploaded:   {len(raw_leads)}")
print(f"   Leads enriched:   {len(enriched)}")
print(f"   Messages created: {len(messages)}")
print(f"   Approved by MIRROR: {len(approved)}")
print(f"   Scheduled to send:  {len(schedule)}")
print("\n⚡ NEXUS ML pipeline complete. Ready for backend integration.")