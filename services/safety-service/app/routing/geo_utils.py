"""Geo utility functions — haversine distance, bbox, deterministic seed."""

import hashlib
import math


EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return haversine great-circle distance in km between two lat/lng points."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lam = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2
    return EARTH_RADIUS_KM * 2 * math.asin(math.sqrt(a))


def get_bbox(
    origin: tuple[float, float],
    destination: tuple[float, float],
    padding_pct: float = 0.25,
) -> dict:
    """Return bounding box covering both points with percentage padding on each side."""
    lats = [origin[0], destination[0]]
    lngs = [origin[1], destination[1]]

    lat_span = max(abs(max(lats) - min(lats)), 0.005)  # at least ~500m span
    lng_span = max(abs(max(lngs) - min(lngs)), 0.005)

    return {
        "min_lat": min(lats) - lat_span * padding_pct,
        "max_lat": max(lats) + lat_span * padding_pct,
        "min_lng": min(lngs) - lng_span * padding_pct,
        "max_lng": max(lngs) + lng_span * padding_pct,
    }


def bbox_hash_seed(bbox: dict) -> int:
    """Deterministic integer seed derived from rounded bbox coordinates.

    Rounds each corner to 3 decimal places, concatenates, and returns
    the first 8 hex digits of the MD5 hash as an integer.
    Same bbox → same seed → same heatmap every time.
    """
    key = (
        f"{round(bbox['min_lat'], 3)}"
        f"{round(bbox['max_lat'], 3)}"
        f"{round(bbox['min_lng'], 3)}"
        f"{round(bbox['max_lng'], 3)}"
    )
    return int(hashlib.md5(key.encode()).hexdigest()[:8], 16)
