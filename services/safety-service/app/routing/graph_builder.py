"""Grid graph builder with risk-weighted edges for safety routing."""

import networkx as nx

from app.routing.geo_utils import haversine_km, get_bbox, bbox_hash_seed
from app.routing.heatmap import generate_risk_hotspots, get_risk_at


RISK_PENALTY_FACTOR = 5.0   # multiplier: how aggressively A* avoids risk zones


def build_grid_graph(
    origin: tuple[float, float],
    destination: tuple[float, float],
) -> tuple[nx.Graph, str, str, list[dict]]:
    """Build a risk-weighted grid graph between origin and destination.

    Returns:
        G             — the NetworkX graph
        origin_node   — node ID nearest to origin
        dest_node     — node ID nearest to destination
        hotspots      — risk hotspots (for heatmap rendering)
    """
    direct_distance = haversine_km(origin[0], origin[1], destination[0], destination[1])

    # Edge case: origin and destination are virtually the same point (<50 m)
    if direct_distance < 0.05:
        G = nx.Graph()
        G.add_node("origin", lat=origin[0], lng=origin[1], risk=0.0)
        G.add_node("dest", lat=destination[0], lng=destination[1], risk=0.0)
        G.add_edge(
            "origin",
            "dest",
            distance=direct_distance,
            risk_weight=direct_distance,
        )
        return G, "origin", "dest", []

    # Choose grid resolution based on distance to keep edge count manageable
    if direct_distance < 2:
        grid_size = 12
    elif direct_distance < 10:
        grid_size = 10
    else:
        grid_size = 8

    bbox = get_bbox(origin, destination)
    seed = bbox_hash_seed(bbox)
    hotspots = generate_risk_hotspots(bbox, seed)

    lat_step = (bbox["max_lat"] - bbox["min_lat"]) / (grid_size - 1)
    lng_step = (bbox["max_lng"] - bbox["min_lng"]) / (grid_size - 1)

    G = nx.Graph()

    # Add all grid nodes
    for i in range(grid_size):
        for j in range(grid_size):
            lat = bbox["min_lat"] + i * lat_step
            lng = bbox["min_lng"] + j * lng_step
            risk = get_risk_at(lat, lng, hotspots)
            node_id = f"{i}_{j}"
            G.add_node(node_id, lat=lat, lng=lng, risk=risk)

    # Connect each node to its 8-directional Moore neighbours
    for i in range(grid_size):
        for j in range(grid_size):
            node_a = f"{i}_{j}"
            a = G.nodes[node_a]
            for di in range(-1, 2):
                for dj in range(-1, 2):
                    if di == 0 and dj == 0:
                        continue
                    ni, nj = i + di, j + dj
                    if 0 <= ni < grid_size and 0 <= nj < grid_size:
                        node_b = f"{ni}_{nj}"
                        if G.has_edge(node_a, node_b):
                            continue
                        b = G.nodes[node_b]
                        dist = haversine_km(a["lat"], a["lng"], b["lat"], b["lng"])
                        avg_risk = (a["risk"] + b["risk"]) / 2
                        G.add_edge(
                            node_a,
                            node_b,
                            distance=dist,
                            risk_weight=dist * (1 + RISK_PENALTY_FACTOR * avg_risk),
                        )

    # Find grid nodes nearest to origin and destination
    def nearest_node(lat: float, lng: float) -> str:
        best_id = None
        best_dist = float("inf")
        for node_id, data in G.nodes(data=True):
            d = haversine_km(lat, lng, data["lat"], data["lng"])
            if d < best_dist:
                best_dist = d
                best_id = node_id
        return best_id

    origin_node = nearest_node(origin[0], origin[1])
    dest_node = nearest_node(destination[0], destination[1])

    return G, origin_node, dest_node, hotspots
