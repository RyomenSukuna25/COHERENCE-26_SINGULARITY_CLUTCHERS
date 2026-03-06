import sys
sys.path.insert(0, '.')

from ml.persona.engine import generate_message

leads = [
    {"name": "Rahul Sharma", "company": "TechCorp", "role": "CTO", "persona": "dev"},
    {"name": "Priya Mehta", "company": "StartupXYZ", "role": "HR Manager", "persona": "priya"},
    {"name": "Arjun Singh", "company": "ScaleUp Inc", "role": "CEO", "persona": "arjun"},
]

for lead in leads:
    result = generate_message(lead)
    print("=" * 50)
    print("PERSONA:", result["persona_name"], "-", result["persona_type"])
    print("=" * 50)
    print(result["message"])
    print()