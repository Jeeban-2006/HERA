"""Deterministic risk heatmap generator for the safety routing service."""

import math
import numpy as np

from app.routing.geo_utils import haversine_km


def generate_risk_hotspots(bbox: dict, seed: int, count: int = 5) -> list[dict]:
    """Generate `count` synthetic crime-risk hotspots within bbox.

    Results are fully deterministic for a given (bbox, seed) pair.
    """
    rng = np.random.default_rng(seed)
    hotspots = []
    for _ in range(count):
        hotspots.append(
            {
                "lat": float(rng.uniform(bbox["min_lat"], bbox["max_lat"])),
                "lng": float(rng.uniform(bbox["min_lng"], bbox["max_lng"])),
                "intensity": float(rng.uniform(0.4, 1.0)),
                "radius_km": float(rng.uniform(0.3, 1.2)),
            }
        )
    return hotspots


def get_risk_at(lat: float, lng: float, hotspots: list[dict]) -> float:
    """Compute aggregate risk at (lat, lng) using Gaussian falloff from each hotspot.

    Returns a value clamped to [0, 1].
    """
    total_risk = 0.0
    for h in hotspots:
        dist = haversine_km(lat, lng, h["lat"], h["lng"])
        if dist < h["radius_km"]:
            sigma = h["radius_km"] / 2
            contribution = h["intensity"] * math.exp(-(dist ** 2) / (2 * sigma ** 2))
            total_risk += contribution
    return min(1.0, total_risk)


def generate_heatmap_geojson(
    bbox: dict, hotspots: list[dict], grid_cells: int = 6
) -> dict:
    """Divide bbox into grid_cells x grid_cells polygon cells and assign risk levels.

    Returns a GeoJSON FeatureCollection.
    """
    lat_step = (bbox["max_lat"] - bbox["min_lat"]) / grid_cells
    lng_step = (bbox["max_lng"] - bbox["min_lng"]) / grid_cells

    features = []
    for row in range(grid_cells):
        for col in range(grid_cells):
            lat0 = bbox["min_lat"] + row * lat_step
            lat1 = lat0 + lat_step
            lng0 = bbox["min_lng"] + col * lng_step
            lng1 = lng0 + lng_step

            center_lat = (lat0 + lat1) / 2
            center_lng = (lng0 + lng1) / 2
            risk = get_risk_at(center_lat, center_lng, hotspots)

            if risk > 0.6:
                risk_level = "high"
            elif risk > 0.3:
                risk_level = "medium"
            else:
                risk_level = "low"

            # GeoJSON polygon — exterior ring (counter-clockwise)
            ring = [
                [lng0, lat0],
                [lng1, lat0],
                [lng1, lat1],
                [lng0, lat1],
                [lng0, lat0],  # close ring
            ]

            features.append(
                {
                    "type": "Feature",
                    "geometry": {"type": "Polygon", "coordinates": [ring]},
                    "properties": {
                        "risk_level": risk_level,
                        "risk_value": round(risk, 3),
                    },
                }
            )

    return {"type": "FeatureCollection", "features": features}
