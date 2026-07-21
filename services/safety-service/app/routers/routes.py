"""Routes router: POST /route, GET /heatmap."""

from fastapi import APIRouter

from app.schemas import RouteRequest, RouteResponse, RouteOption, SafetySignal
from app.routing.graph_builder import build_grid_graph
from app.routing.pathfinder import find_fastest_route, find_safest_route
from app.routing.geo_utils import get_bbox, bbox_hash_seed
from app.routing.heatmap import generate_risk_hotspots, generate_heatmap_geojson

router = APIRouter()


@router.post("/route", response_model=RouteResponse)
async def get_route(body: RouteRequest) -> RouteResponse:
    """Build a risk-weighted grid graph and return safest + fastest routes."""
    origin = (body.origin.lat, body.origin.lng)
    destination = (body.destination.lat, body.destination.lng)

    G, origin_node, dest_node, _hotspots = build_grid_graph(origin, destination)

    fastest_dict = find_fastest_route(G, origin_node, dest_node)
    safest_dict = find_safest_route(G, origin_node, dest_node)

    def dict_to_route_option(d: dict) -> RouteOption:
        return RouteOption(
            type=d["type"],
            distance=d["distance"],
            duration=d["duration"],
            safetyScore=d["safetyScore"],
            coordinates=d["coordinates"],
            signals=[SafetySignal(**s) for s in d["signals"]],
        )

    return RouteResponse(
        safestRoute=dict_to_route_option(safest_dict),
        fastestRoute=dict_to_route_option(fastest_dict),
    )


@router.get("/heatmap")
async def get_heatmap(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
) -> dict:
    """Return a GeoJSON FeatureCollection of risk cells for the bounding box."""
    bbox = get_bbox((origin_lat, origin_lng), (dest_lat, dest_lng))
    seed = bbox_hash_seed(bbox)
    hotspots = generate_risk_hotspots(bbox, seed)
    return generate_heatmap_geojson(bbox, hotspots)
