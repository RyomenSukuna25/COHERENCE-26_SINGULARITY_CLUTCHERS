import sys
sys.path.insert(0, '.')

from ml.research.lead_analyzer import analyze_lead, enrich_leads

leads = [
    {"name": "Rahul Sharma", "company": "TechCorp", "role": "CTO"},
    {"name": "Priya Mehta", "company": "StartupXYZ", "role": "HR Manager"},
    {"name": "Arjun Singh", "company": "ScaleUp Inc", "role": "CEO"},
]

print("Enriching leads with AI research...\n")
enriched = enrich_leads(leads)

for lead in enriched:
    print("="*50)
    print(f"👤 {lead['name']} — {lead['role']} at {lead['company']}")
    print(f"🎯 Hook: {lead['hook']}")
    print(f"😰 Pain Points: {', '.join(lead['pain_points'])}")
    print(f"📊 Engagement Score: {lead['score']}/100")
    print(f"💡 Approach: {lead['approach']}")