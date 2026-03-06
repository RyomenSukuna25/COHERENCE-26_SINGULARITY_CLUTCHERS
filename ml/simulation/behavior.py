import random
import math
from datetime import datetime


def get_energy_level(hour: int = None) -> float:
    """
    Returns human energy level 0.0-1.0 based on time of day.
    Peak at 10AM, dip at 2PM, secondary peak at 4PM.
    """
    if hour is None:
        hour = datetime.now().hour

    # No energy outside working hours
    if hour < 8 or hour > 20:
        return 0.0

    # Sine curve peaking at 10AM
    curve = math.sin((hour - 7) * math.pi / 12)

    # Afternoon dip 1PM-3PM
    if 13 <= hour <= 15:
        curve *= 0.5

    return max(0.1, min(1.0, curve))


def get_send_delay(base_minutes: int = 60, email_count: int = 0) -> float:
    """
    Returns randomized delay in seconds.
    Increases with fatigue (more emails sent = slower).
    """
    # Fatigue factor — slows down after many emails
    fatigue = min(0.6, email_count * 0.03)

    # Energy affects speed
    energy = get_energy_level()

    # Random variation ±40%
    variation = random.uniform(0.6, 1.4)

    delay_seconds = (base_minutes * 60) * variation * (1 + fatigue) * max(energy, 0.3)

    return round(delay_seconds, 1)


def should_send_now(hour: int = None) -> bool:
    """
    Returns True if this is a reasonable time to send outreach.
    Respects working hours and energy levels.
    """
    if hour is None:
        hour = datetime.now().hour

    # Never send outside 8AM-8PM
    if hour < 8 or hour > 20:
        return False

    # Avoid lunch hour mostly
    if hour == 13:
        return random.random() > 0.6

    energy = get_energy_level(hour)
    return random.random() < energy


def get_typing_delay() -> float:
    """
    Simulates human typing time before sending.
    Returns seconds.
    """
    return round(random.uniform(1.5, 4.5), 2)


def get_open_probability(hour: int = None) -> float:
    """
    Returns probability that a prospect opens email at this hour.
    Higher in morning and after lunch.
    """
    if hour is None:
        hour = datetime.now().hour

    # Best open times: 9-10AM and 2-3PM
    if 9 <= hour <= 10:
        return random.uniform(0.6, 0.8)
    elif 14 <= hour <= 15:
        return random.uniform(0.4, 0.6)
    elif 8 <= hour <= 18:
        return random.uniform(0.2, 0.4)
    else:
        return random.uniform(0.0, 0.1)


def simulate_day_schedule(num_emails: int = 10) -> list:
    """
    Simulates a full day send schedule for N emails.
    Returns list of send times spread across working hours.
    """
    schedule = []
    current_hour = 9  # Start at 9AM
    current_minute = 0

    for i in range(num_emails):
        # Add delay between sends
        delay_seconds = get_send_delay(base_minutes=30, email_count=i)
        current_minute += delay_seconds / 60

        # Move to next hour if needed
        while current_minute >= 60:
            current_minute -= 60
            current_hour += 1

        # Stop after 6PM
        if current_hour >= 18:
            break

        schedule.append({
            "email_number": i + 1,
            "send_hour": current_hour,
            "send_minute": int(current_minute),
            "energy_level": round(get_energy_level(current_hour), 2),
            "typing_delay": get_typing_delay()
        })

    return schedule