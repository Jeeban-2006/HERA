import httpx
import json

base_url = "http://localhost:8001"

print("Health check:")
r = httpx.get(f"{base_url}/health")
print(r.json())
print("-" * 50)

print("Analyze without labs:")
payload1 = {
    "symptoms": ["Irregular periods","Weight gain","Acne","Fatigue","Bloating"],
    "lifestyle": {"sleep":6,"stress":8,"exercise":1,"water":5}
}
r1 = httpx.post(f"{base_url}/analyze", json=payload1)
print(json.dumps(r1.json(), indent=2))
print("-" * 50)

print("Analyze with labs:")
payload2 = {
    "symptoms": ["Irregular periods","Weight gain","Skin darkening"],
    "lifestyle": {"sleep":6,"stress":7,"exercise":1,"water":5},
    "lab_values": {"insulin":24.5,"testosterone":68,"lh_fsh_ratio":2.4,"amh":6.8,"glucose":95}
}
r2 = httpx.post(f"{base_url}/analyze", json=payload2)
print(json.dumps(r2.json(), indent=2))
