"""
ml/persona/profiles.py
Persona definitions for NEXUS v2.
Each persona has a Gemini system prompt AND a rich fallback that looks AI-generated.
Fallbacks are 4 paragraphs minimum so even without Gemini the demo looks great.
"""

PERSONAS = {
    'arjun': {
        'name': 'Arjun',
        'type': 'The Closer',
        'max_words': 200,
        'tone': 'direct, confident, urgent, outcome-focused',
        'system_prompt': """You are Arjun, a confident and direct B2B sales professional.
Your style: short punchy sentences. No filler. Create urgency. Reference specific outcomes.

Write a cold outreach email with EXACTLY this structure:
Paragraph 1 (2-3 sentences): Hook — reference something SPECIFIC about their company or role. Make them feel you did research.
Paragraph 2 (2-3 sentences): Name their EXACT pain point as if you already know it. Be specific to their industry.
Paragraph 3 (2-3 sentences): State the outcome/result with a specific number or benchmark. Don't pitch features — pitch results.
Paragraph 4 (1-2 sentences): ONE clear CTA. Direct question. No multiple asks.

Rules: No subject line. No "I hope this email finds you well". No "reaching out to connect". 
Start with their name. End with — Arjun""",
    },

    'priya': {
        'name': 'Priya',
        'type': 'The Nurturer',
        'max_words': 250,
        'tone': 'warm, empathetic, story-driven, relationship-first',
        'system_prompt': """You are Priya, a warm and empathetic B2B sales professional.
Your style: build genuine connection. Validate before selling. Tell micro-stories. No pressure.

Write a cold outreach email with EXACTLY this structure:
Paragraph 1 (2-3 sentences): Acknowledge something real about their situation — show you understand the challenge they face in their role.
Paragraph 2 (3-4 sentences): Share a brief story about another team/person in a similar situation (make it relatable and specific, not generic).
Paragraph 3 (2-3 sentences): How things changed for that team — the outcome should feel achievable and human, not just a stat.
Paragraph 4 (2 sentences): Soft CTA — an invitation, not a pitch. Ask a question that's easy to say yes to.

Rules: No subject line. Don't start with "I". Warm but professional. No pressure language.
End with — Priya""",
    },

    'dev': {
        'name': 'Dev',
        'type': 'The Analyst',
        'max_words': 220,
        'tone': 'data-driven, precise, technical, credibility-first',
        'system_prompt': """You are Dev, a technical and data-driven B2B sales professional.
Your style: lead with data. Use benchmarks. Speak their technical language. Build credibility fast.

Write a cold outreach email with EXACTLY this structure:
Paragraph 1 (2-3 sentences): Open with a surprising or counterintuitive industry stat. Make it relevant to their specific role and company scale.
Paragraph 2 (3-4 sentences): Diagnose the technical or operational root cause of the problem. Be specific — name the exact failure mode they're experiencing.
Paragraph 3 (2-3 sentences): Present evidence-based solution with measurable outcomes. Use specific metrics — percentages, time saved, conversion rates.
Paragraph 4 (1-2 sentences): Technical CTA — propose something testable or measurable, like a pilot or an audit.

Rules: No subject line. Reference their company size/stage if known. Use numbers.
End with — Dev""",
    },
}


def assign_persona(role: str) -> str:
    """
    Auto-assign persona based on job title.
    Arjun: Sales, Revenue, Business, Founder, CEO roles
    Priya: HR, People, Recruiting, Marketing, Operations
    Dev: CTO, Engineering, Technical, Data, Product
    """
    role_lower = role.lower()

    dev_keywords = ['cto', 'engineer', 'technical', 'developer', 'data', 'architect',
                    'infrastructure', 'devops', 'platform', 'backend', 'software', 'product']
    priya_keywords = ['hr', 'human resources', 'people', 'talent', 'recruit', 'culture',
                      'marketing', 'content', 'brand', 'operations', 'ops', 'office']
    arjun_keywords = ['ceo', 'founder', 'sales', 'revenue', 'business', 'growth', 'partner',
                      'president', 'director', 'commercial', 'account', 'bd', 'vp']

    for kw in dev_keywords:
        if kw in role_lower:
            return 'dev'
    for kw in arjun_keywords:
        if kw in role_lower:
            return 'arjun'
    for kw in priya_keywords:
        if kw in role_lower:
            return 'priya'

    return 'arjun'  # default


def get_rich_fallback(lead: dict, persona_key: str) -> str:
    """
    Rich fallback emails - 4 paragraphs, looks AI-generated.
    Used when Gemini is rate-limited or unavailable.
    Each is unique per persona and references the lead's actual data.
    """
    name = lead.get('name', 'there')
    first = name.split()[0]
    company = lead.get('company', 'your company')
    role = lead.get('role', 'your role')
    industry = lead.get('industry', 'your industry')
    pain_points = lead.get('pain_points', [])
    hook = lead.get('hook', '')

    pain_line = pain_points[0] if pain_points else f'outreach efficiency at {company}'

    if persona_key == 'dev':
        return f"""Hi {first},

Most engineering leaders I speak with at {industry} companies your size are dealing with the same paradox: the team is technically excellent, but the outreach process feeding the pipeline still runs on spreadsheets and manual follow-ups. At {company}'s current growth stage, that gap compounds fast.

The root cause is usually the same — outreach tools built for volume, not signal. Every email looks identical regardless of whether the prospect opened it, clicked it, or has been cold for 3 weeks. There's no feedback loop, which means engineering talent ends up nursing a leaky funnel instead of solving real problems.

Teams that switched to signal-driven outreach — where each follow-up is triggered by actual behavior, not a fixed day-7 timer — saw 3x reply rates and 40% reduction in time-to-first-meeting. For a {role} like you, that means less noise, better pipeline visibility, and more time for what actually matters.

Would it be worth a 15-minute technical walkthrough to see if this maps to {company}'s setup?

— Dev"""

    elif persona_key == 'arjun':
        return f"""Hi {first},

{company} is scaling. That's obvious from the outside. What's less obvious is whether your outreach motion is scaling with it — or whether your team is working 3x harder to get the same results.

Here's what I see at {industry} companies at your stage: reply rates under 8%, follow-up sequences that ignore whether a prospect actually engaged, and sales reps burning hours on manual personalization that could be automated in 20 minutes. The bottleneck isn't effort. It's intelligence.

We helped a {industry} team almost identical to {company} go from a 6% reply rate to 22% in 11 days — not by sending more emails, but by sending smarter ones. Every message was calibrated to the prospect's behavior, role, and objection pattern before it was sent.

Open to a 20-minute call this week to show you exactly what changed?

— Arjun"""

    else:  # priya
        return f"""Hi {first},

I came across {company} while researching {industry} teams that are growing fast, and I wanted to reach out personally — not with a template, but because your situation reminded me of someone I spoke with recently.

Sarah, a {role} at a similar-stage company, was spending nearly 4 hours every day on outreach follow-ups. Not because she wasn't good at her job — she was excellent. But the tools she had didn't help her know who was actually interested and who had gone cold. She was putting equal energy into leads that would never convert and leads that were ready to talk. It was exhausting.

After switching to a signal-driven approach — where the system tells you who to reach out to and when, based on their actual behavior — her reply rate doubled in two weeks. More importantly, she got her afternoons back.

I'd love to share what worked for her team and see if it makes sense for {company}. Would a 20-minute conversation this week work for you?

— Priya"""