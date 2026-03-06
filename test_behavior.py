import sys
sys.path.insert(0, '.')

from ml.simulation.behavior import (
    get_energy_level,
    get_send_delay,
    should_send_now,
    get_typing_delay,
    simulate_day_schedule
)

print("⚡ NEXUS BEHAVIOR SIMULATION")
print("="*50)

print("\n📊 Energy Levels Throughout The Day:")
for hour in [8, 9, 10, 11, 13, 14, 15, 17, 19]:
    energy = get_energy_level(hour)
    bar = "█" * int(energy * 20)
    print(f"  {hour:02d}:00  {bar} {energy:.2f}")

print("\n⏳ Send Delays (base 60 mins, with fatigue):")
for count in [0, 5, 10, 20]:
    delay = get_send_delay(60, count)
    print(f"  After {count:2d} emails: {delay/60:.1f} mins delay")

print("\n✅ Should Send Right Now:", should_send_now())
print("⌨️  Typing Delay:", get_typing_delay(), "seconds")

print("\n📅 Simulated Day Schedule (10 emails):")
schedule = simulate_day_schedule(10)
for slot in schedule:
    print(f"  Email {slot['email_number']:2d} → "
          f"{slot['send_hour']:02d}:{slot['send_minute']:02d} "
          f"| Energy: {slot['energy_level']} "
          f"| Typing: {slot['typing_delay']}s")