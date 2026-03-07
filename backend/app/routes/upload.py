from fastapi import APIRouter, UploadFile
import pandas as pd
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from ml.persona.profiles import assign_persona

router = APIRouter()

def safe_str(val):
    try:
        if pd.isna(val):
            return ""
    except Exception:
        pass
    return str(val).strip()

def score_for_role(role: str) -> int:
    role_lower = role.lower()
    if any(x in role_lower for x in ['cto', 'ceo', 'coo', 'founder', 'vp', 'president']):
        return 82
    if any(x in role_lower for x in ['head', 'director', 'manager', 'lead']):
        return 71
    return 65

def pain_points_for_industry(industry: str, role: str) -> list:
    ind = industry.lower()
    role_l = role.lower()
    if 'saas' in ind or 'software' in ind:
        return ['Manual outreach not scaling with growth', 'Low cold email reply rates under 2%', 'Sales cycle too long']
    if 'fin' in ind:
        return ['Pipeline visibility is poor', 'Compliance slowing outreach', 'Cold conversion under 2%']
    if 'ai' in ind or 'data' in ind:
        return ['Engineering hiring pipeline broken', 'Tech debt slowing velocity', 'Outreach feels generic']
    if 'market' in ind:
        return ['CAC too high', 'Outbound not converting', 'Attribution unclear']
    if 'hr' in ind or 'recruit' in ind:
        return ['3+ hours/day on manual outreach', 'No visibility into follow-up', 'Team coordination gaps']
    return ['Manual outreach taking too long', 'Low reply rates on cold emails', 'Pipeline not converting']

@router.post("/api/leads/upload")
async def upload_leads(file: UploadFile):
    try:
        df = pd.read_excel(file.file)
    except Exception:
        file.file.seek(0)
        df = pd.read_csv(file.file)

    leads = []
    for i, row in df.iterrows():
        # Handle first_name + last_name columns
        first = safe_str(row.get("first_name", row.get("First Name", row.get("name", row.get("Name", "")))))
        last  = safe_str(row.get("last_name",  row.get("Last Name",  "")))
        name  = f"{first} {last}".strip() if last else first
        if not name:
            name = f"Lead {i+1}"

        role     = safe_str(row.get("job_title", row.get("role", row.get("Role", row.get("title", "")))))
        company  = safe_str(row.get("company",   row.get("Company", "")))
        email    = safe_str(row.get("email",     row.get("Email", "")))
        industry = safe_str(row.get("industry",  row.get("Industry", "Technology")))

        persona_key = assign_persona(role).lower()
        score       = score_for_role(role)
        pain_points = pain_points_for_industry(industry, role)
        hook        = f"{company} — {role} at a critical growth stage." if company else f"{role} — outreach opportunity."
        approach    = f"Lead with value relevant to {role} in {industry}."

        lead = {
            "id":          str(i + 1),
            "name":        name,
            "email":       email,
            "company":     company,
            "role":        role,
            "industry":    industry,
            "persona":     persona_key,
            "status":      "pending",
            "score":       score,
            "pain_points": pain_points,
            "hook":        hook,
            "approach":    approach,
        }
        leads.append(lead)

    return {"total_leads": len(leads), "leads": leads}