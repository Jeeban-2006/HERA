import httpx, json, sys
sys.stdout.reconfigure(encoding="utf-8")

BASE = "http://localhost:8003"

def pretty(label, r):
    print(f"\n{'='*60}")
    print(f"TEST: {label}")
    print(f"HTTP {r.status_code}")
    try:
        print(json.dumps(r.json(), indent=2)[:2000])
    except Exception:
        print(r.text[:500])

# ── 1. Health check ────────────────────────────────────────────
r = httpx.get(f"{BASE}/health")
pretty("Health check", r)
assert r.status_code == 200 and r.json()["status"] == "ok", "HEALTH FAIL"

BANDRA_TO_ANDHERI = {
    "origin": {"lat": 19.0544, "lng": 72.8347},
    "destination": {"lat": 19.1136, "lng": 72.8479}
}

# ── 2. Route Bandra → Andheri (first call) ─────────────────────
r1 = httpx.post(f"{BASE}/route", json=BANDRA_TO_ANDHERI, timeout=15)
pretty("Route Bandra→Andheri (call 1)", r1)
assert r1.status_code == 200, "ROUTE FAIL call 1"
body1 = r1.json()
assert "safestRoute" in body1 and "fastestRoute" in body1, "Missing keys"
sr = body1["safestRoute"]
fr = body1["fastestRoute"]
assert len(sr["coordinates"]) > 1, "Safest route has no coords"
assert len(fr["coordinates"]) > 1, "Fastest route has no coords"
assert sr["safetyScore"] >= fr["safetyScore"], f"Safest {sr['safetyScore']} < fastest {fr['safetyScore']}"
print(f"\n✅ safetyScore check: safest={sr['safetyScore']} >= fastest={fr['safetyScore']}")
print(f"   safest signals: {[s['iconName'] for s in sr['signals']]}")
print(f"   fastest signals: {[s['iconName'] for s in fr['signals']]}")

# ── 3. Determinism: repeat exactly ─────────────────────────────
r2 = httpx.post(f"{BASE}/route", json=BANDRA_TO_ANDHERI, timeout=15)
pretty("Route Bandra→Andheri (call 2 — determinism)", r2)
body2 = r2.json()
assert body1 == body2, "DETERMINISM FAIL — results differ between identical calls!"
print("✅ Determinism check: both calls identical")

# ── 4. Very close points (<50 m) ────────────────────────────────
r3 = httpx.post(f"{BASE}/route", json={
    "origin": {"lat": 19.0544, "lng": 72.8347},
    "destination": {"lat": 19.0545, "lng": 72.8348}
}, timeout=10)
pretty("Near-zero route (<50m)", r3)
assert r3.status_code == 200, "NEAR-ZERO FAIL"
d = float(r3.json()["fastestRoute"]["distance"].split()[0])
assert d < 0.1, f"Expected near-zero distance, got {d}"
print(f"✅ Near-zero distance: {d} km")

# ── 5. Heatmap ──────────────────────────────────────────────────
r4 = httpx.get(
    f"{BASE}/heatmap",
    params={"origin_lat": 19.0544, "origin_lng": 72.8347,
            "dest_lat": 19.1136, "dest_lng": 72.8479},
    timeout=10
)
pretty("Heatmap GeoJSON", r4)
assert r4.status_code == 200, "HEATMAP FAIL"
geo = r4.json()
assert geo["type"] == "FeatureCollection", "Not a FeatureCollection"
assert len(geo["features"]) == 36, f"Expected 36 cells, got {len(geo['features'])}"
risk_levels = {f["properties"]["risk_level"] for f in geo["features"]}
print(f"✅ Heatmap: 36 cells, risk levels present: {risk_levels}")

print("\n\n🎉 ALL TESTS PASSED")
