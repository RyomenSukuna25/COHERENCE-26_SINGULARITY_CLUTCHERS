from ml.mirror.simulator import simulate_prospect, apply_fix


def score_message(lead: dict, message: str, threshold: int = 60) -> dict:
    """
    Scores a message and returns whether it passes the threshold.
    If it fails, it auto-fixes and re-scores once.
    """
    print(f"🪞 MIRROR scoring message for {lead['name']}...")
    simulation = simulate_prospect(lead, message)
    score = simulation["score"]

    if score >= threshold:
        return {
            "approved": True,
            "original_message": message,
            "final_message": message,
            "score": score,
            "reaction": simulation["reaction"],
            "attempts": 1
        }

    # Score too low — auto fix
    print(f"⚠️ Score {score}/100 below threshold {threshold}. Auto-fixing...")
    improved = apply_fix(lead, message, simulation["fix"])
    simulation2 = simulate_prospect(lead, improved)
    score2 = simulation2["score"]

    return {
        "approved": score2 >= threshold,
        "original_message": message,
        "final_message": improved,
        "original_score": score,
        "score": score2,
        "reaction": simulation2["reaction"],
        "fix_applied": simulation["fix"],
        "attempts": 2
    }


def batch_score(leads_and_messages: list, threshold: int = 60) -> list:
    """
    Scores a list of (lead, message) pairs.
    Returns results for all leads.
    """
    results = []
    for item in leads_and_messages:
        lead = item["lead"]
        message = item["message"]
        result = score_message(lead, message, threshold)
        result["lead_name"] = lead["name"]
        results.append(result)
    return results