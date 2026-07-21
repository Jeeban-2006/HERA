"""Pathfinding algorithms: Dijkstra (fastest) + A* (safest)."""

import networkx as nx

from app.routing.geo_utils import haversine_km


WALKING_SPEED_KMH = 4.5


def find_fastest_route(G: nx.Graph, source: str, target: str) -> dict:
    """Dijkstra shortest-distance path — minimises total travel distance."""
    path = nx.dijkstra_path(G, source, target, weight="distance")
    return _build_route_result(G, path, route_type="fastest")


def find_safest_route(G: nx.Graph, source: str, target: str) -> dict:
    """A* path — minimises risk-weighted distance using admissible haversine heuristic.

    Heuristic h(u) = haversine(u → goal).
    Since edge_weight = distance * (1 + risk_penalty) ≥ distance,
    haversine never overestimates → admissible ✓
    """

    def heuristic(u: str, v: str) -> float:
        nu, nv = G.nodes[u], G.nodes[v]
        return haversine_km(nu["lat"], nu["lng"], nv["lat"], nv["lng"])

    path = nx.astar_path(G, source, target, heuristic=heuristic, weight="risk_weight")
    return _build_route_result(G, path, route_type="safest")


def _build_route_result(G: nx.Graph, path: list[str], route_type: str) -> dict:
    """Convert a node-id path into the RouteOption response dict."""
    total_distance_km = 0.0
    risk_values: list[float] = []
    coordinates: list[list[float]] = []  # [[lng, lat], ...] — GeoJSON order

    for i, node_id in enumerate(path):
        node = G.nodes[node_id]
        coordinates.append([node["lng"], node["lat"]])
        risk_values.append(node["risk"])
        if i > 0:
            prev = G.nodes[path[i - 1]]
            total_distance_km += haversine_km(
                prev["lat"], prev["lng"], node["lat"], node["lng"]
            )

    avg_risk = sum(risk_values) / len(risk_values) if risk_values else 0.0
    safety_score = round(max(0.0, min(10.0, 10.0 - avg_risk * 10.0)), 1)
    duration_min = round((total_distance_km / WALKING_SPEED_KMH) * 60)

    return {
        "type": route_type,
        "distance": f"{round(total_distance_km, 1)} km",
        "duration": f"{max(1, duration_min)} min",
        "safetyScore": safety_score,
        "coordinates": coordinates,
        "signals": _generate_signals(avg_risk, route_type),
    }


def _generate_signals(avg_risk: float, route_type: str) -> list[dict]:
    """Return contextual safety signals based on average risk level."""
    if avg_risk < 0.3:
        return [
            {
                "type": "police",
                "description": "Police station within 200m",
                "iconName": "ShieldCheck",
                "positive": True,
            },
            {
                "type": "lighting",
                "description": "Well-lit commercial area",
                "iconName": "Sun",
                "positive": True,
            },
            {
                "type": "traffic",
                "description": "High foot traffic detected",
                "iconName": "Users",
                "positive": True,
            },
            {
                "type": "cctv",
                "description": "CCTV coverage along route",
                "iconName": "Camera",
                "positive": True,
            },
        ]
    elif avg_risk < 0.6:
        return [
            {
                "type": "lighting",
                "description": "Moderate lighting conditions",
                "iconName": "Sun",
                "positive": True,
            },
            {
                "type": "traffic",
                "description": "Moderate foot traffic",
                "iconName": "Users",
                "positive": True,
            },
            {
                "type": "caution",
                "description": "Some unlit stretches reported",
                "iconName": "Moon",
                "positive": False,
            },
        ]
    else:
        return [
            {
                "type": "lighting",
                "description": "Poor lighting reported",
                "iconName": "Moon",
                "positive": False,
            },
            {
                "type": "isolation",
                "description": "Isolated stretch — low foot traffic",
                "iconName": "Users",
                "positive": False,
            },
            {
                "type": "caution",
                "description": "Limited safety infrastructure",
                "iconName": "AlertCircle",
                "positive": False,
            },
        ]
