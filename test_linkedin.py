import sys
sys.path.insert(0, '.')

from ml.channels.linkedin_generator import generate_linkedin_message

leads = [
    {"name": "Rahul Sharma", "company": "TechCorp", "role": "CTO"},
    {"name": "Priya Mehta", "company": "StartupXYZ", "role": "HR Manager"},
    {"name": "Arjun Singh", "company": "ScaleUp Inc", "role": "CEO"},
]

print("💼 LINKEDIN FALLBACK GENERATOR TEST")
print("="*50)

for lead in leads:
    result = generate_linkedin_message(lead)
    print(f"\n👤 {lead['name']} — {lead['role']}")
    print(f"🤖 Persona: {result['persona_name']}")
    print(f"💬 Message ({result['char_count']} chars):")
    print(f"   {result['message']}")