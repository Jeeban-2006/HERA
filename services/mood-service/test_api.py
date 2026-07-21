import httpx
import json

base_url = "http://localhost:8002"

print("Health check:")
try:
    r = httpx.get(f"{base_url}/health")
    print(r.json())
except Exception as e:
    print("Health check failed:", e)

print("-" * 50)

print("Correlation analysis (14 logs):")
payload = {
  "cycle_length": 28,
  "last_period_date": "2026-05-20",
  "logs": [
    {"date":"2026-05-25","mood_score":8,"energy_level":8,"cycle_day":6},
    {"date":"2026-05-26","mood_score":8,"energy_level":7,"cycle_day":7},
    {"date":"2026-05-27","mood_score":7,"energy_level":8,"cycle_day":8},
    {"date":"2026-05-28","mood_score":8,"energy_level":7,"cycle_day":9},
    {"date":"2026-05-29","mood_score":9,"energy_level":9,"cycle_day":10},
    {"date":"2026-05-30","mood_score":8,"energy_level":8,"cycle_day":11},
    {"date":"2026-06-01","mood_score":7,"energy_level":7,"cycle_day":13},
    {"date":"2026-06-03","mood_score":6,"energy_level":6,"cycle_day":15},
    {"date":"2026-06-05","mood_score":5,"energy_level":5,"cycle_day":17},
    {"date":"2026-06-07","mood_score":4,"energy_level":4,"cycle_day":19},
    {"date":"2026-06-08","mood_score":4,"energy_level":4,"cycle_day":20},
    {"date":"2026-06-09","mood_score":3,"energy_level":3,"cycle_day":21},
    {"date":"2026-06-10","mood_score":4,"energy_level":4,"cycle_day":22},
    {"date":"2026-06-11","mood_score":3,"energy_level":3,"cycle_day":23}
  ]
}
try:
    r = httpx.post(f"{base_url}/analyze/correlation", json=payload)
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print("Correlation analysis failed:", e)

print("-" * 50)

print("Correlation analysis (Edge case < 3 logs):")
payload2 = {
    "cycle_length": 28,
    "logs": [
        {"date":"2026-06-10","mood_score":7}
    ]
}
try:
    r2 = httpx.post(f"{base_url}/analyze/correlation", json=payload2)
    print(json.dumps(r2.json(), indent=2))
except Exception as e:
    print("Edge case failed:", e)
