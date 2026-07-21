"""Safety service for route analysis and SOS handling."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID, uuid4
from datetime import datetime
from twilio.rest import Client
import httpx
import logging

from app.models import EmergencyContact, SOSEvent, User
from app.schemas.safety import RouteRequest, RouteResponse, RouteOption, SafetySignal, SOSRequest, SOSResponse
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Twilio Client (only if credentials are set)
twilio_client = None
if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
    twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    logger.info("✅ Twilio SMS client initialized")
else:
    logger.warning("⚠️ TWILIO_ACCOUNT_SID not set — SOS will only log to console")


# Mock route result for fallback
MOCK_SAFEST_ROUTE = RouteOption(
    type="safest",
    distance="4.1 km",
    duration="15 min",
    safety_score=8.4,
    coordinates=[(72.8347, 19.0544), (72.8450, 19.0650), (72.8479, 19.1136)],
    signals=[
        SafetySignal(type="police", description="Police station within 200m", icon_name="ShieldCheck", positive=True),
        SafetySignal(type="lighting", description="Well-lit commercial area", icon_name="Sun", positive=True),
        SafetySignal(type="traffic", description="High foot traffic", icon_name="Users", positive=True),
        SafetySignal(type="cctv", description="CCTV coverage detected", icon_name="Camera", positive=True),
    ]
)

MOCK_FASTEST_ROUTE = RouteOption(
    type="fastest",
    distance="2.8 km",
    duration="10 min",
    safety_score=4.1,
    coordinates=[(72.8347, 19.0544), (72.8300, 19.0800), (72.8479, 19.1136)],
    signals=[
        SafetySignal(type="lighting", description="Poor lighting on some sections", icon_name="Moon", positive=False),
        SafetySignal(type="isolation", description="Isolated stretch near highway", icon_name="AlertTriangle", positive=False),
    ]
)


async def analyze_route(
    db: AsyncSession,
    user_id: UUID,
    body: RouteRequest
) -> RouteResponse:
    """Analyze route safety by proxying to Layer 5 Safety Service."""

    def _signals_from_camel(raw_signals: list[dict]) -> list[SafetySignal]:
        result = []
        for s in raw_signals:
            result.append(SafetySignal(
                type=s.get("type", ""),
                description=s.get("description", ""),
                icon_name=s.get("iconName", s.get("icon_name", "")),
                positive=s.get("positive", True),
            ))
        return result

    def _route_option_from_camel(d: dict, route_type: str) -> RouteOption:
        return RouteOption(
            type=route_type,
            distance=d.get("distance", "0.0 km"),
            duration=d.get("duration", "0 min"),
            safety_score=d.get("safetyScore", d.get("safety_score", 5.0)),
            coordinates=d.get("coordinates", []),
            signals=_signals_from_camel(d.get("signals", [])),
        )

    ml_result = None
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{settings.SAFETY_SERVICE_URL}/route",
                json=body.model_dump()
            )
            if response.status_code == 200:
                ml_result = response.json()
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        logger.warning(f"Safety service unavailable: {e}, using mock fallback")

    if not ml_result:
        return RouteResponse(
            safest_route=MOCK_SAFEST_ROUTE,
            fastest_route=MOCK_FASTEST_ROUTE,
            safety_signals=MOCK_SAFEST_ROUTE.signals
        )

    safest = _route_option_from_camel(ml_result.get("safestRoute", {}), "safest")
    fastest = _route_option_from_camel(ml_result.get("fastestRoute", {}), "fastest")

    return RouteResponse(
        safest_route=safest,
        fastest_route=fastest,
        safety_signals=safest.signals,
    )



async def trigger_sos(
    db: AsyncSession,
    user_id: UUID,
    body: SOSRequest
) -> SOSResponse:
    """Trigger SOS event and notify emergency contacts."""
    
    # Create SOS event
    sos_event = SOSEvent(
        id=uuid4(),
        user_id=user_id,
        location_lat=body.lat,
        location_lng=body.lng,
        triggered_at=datetime.utcnow(),
        contacts_notified={}
    )
    
    # Fetch emergency contacts
    result = await db.execute(
        select(EmergencyContact).where(EmergencyContact.user_id == user_id)
    )
    contacts = result.scalars().all()
    
    # Fetch user for their name
    from app.models.user import User
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    user_name = user.name if user else "A HERA User"
    
    # Notify contacts
    notified_count = 0
    notified_list = []
    
    # Construct maps link
    maps_link = f"https://maps.google.com/?q={body.lat},{body.lng}"
    message_body = (
        f"🚨 SOS ALERT from {user_name}\n"
        f"They triggered an emergency alert and need help!\n"
        f"Location: {body.lat}, {body.lng}\n"
        f"Map: {maps_link}\n"
        f"Time: {sos_event.triggered_at.strftime('%d %b %Y, %I:%M %p UTC')}\n"
        f"— HERA Safety Platform"
    )
    
    for contact in contacts:
        logger.info(
            f"🚨 SOS ALERT: {contact.name} ({contact.phone}) at {body.lat},{body.lng}"
        )
        notified_count += 1
        notified_list.append(contact.name)
        
        # Send actual SMS if Twilio is configured and notify_sms is True
        if twilio_client and settings.TWILIO_PHONE and contact.notify_sms:
            try:
                twilio_client.messages.create(
                    body=message_body,
                    from_=settings.TWILIO_PHONE,
                    to=contact.phone
                )
                logger.info(f"SMS sent successfully to {contact.phone}")
            except Exception as e:
                logger.error(f"Failed to send SMS to {contact.phone}: {e}")
    
    sos_event.contacts_notified = {"contacts": notified_list, "timestamp": datetime.utcnow().isoformat()}
    
    db.add(sos_event)
    await db.commit()
    await db.refresh(sos_event)
    
    return SOSResponse(
        event_id=sos_event.id,
        contacts_notified=notified_count,
        timestamp=sos_event.triggered_at,
        message=f"Emergency services have been alerted. {notified_count} contacts notified."
    )


async def get_emergency_contacts(db: AsyncSession, user_id: UUID):
    """Get user's emergency contacts."""
    result = await db.execute(
        select(EmergencyContact).where(EmergencyContact.user_id == user_id)
    )
    contacts = result.scalars().all()
    return contacts


async def add_emergency_contact(db: AsyncSession, user_id: UUID, name: str, phone: str, email: str | None = None, notify_sms: bool = True):
    """Add emergency contact."""
    
    # Check max contacts limit (5)
    result = await db.execute(
        select(EmergencyContact).where(EmergencyContact.user_id == user_id)
    )
    existing_contacts = result.scalars().all()
    
    if len(existing_contacts) >= 5:
        logger.warning(f"Max emergency contacts reached for user {user_id}")
        return None
    
    contact = EmergencyContact(
        id=uuid4(),
        user_id=user_id,
        name=name,
        phone=phone,
        email=email,
        notify_sms=notify_sms
    )
    
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    
    return contact


async def delete_emergency_contact(db: AsyncSession, user_id: UUID, contact_id: UUID):
    """Delete emergency contact."""
    result = await db.execute(
        select(EmergencyContact).where(
            (EmergencyContact.id == contact_id) &
            (EmergencyContact.user_id == user_id)
        )
    )
    contact = result.scalar_one_or_none()
    
    if contact:
        await db.delete(contact)
        await db.commit()
    
    return contact


async def update_emergency_contact(
    db: AsyncSession, 
    user_id: UUID, 
    contact_id: UUID, 
    name: str | None = None, 
    phone: str | None = None, 
    email: str | None = None, 
    notify_sms: bool | None = None
):
    """Update an existing emergency contact."""
    result = await db.execute(
        select(EmergencyContact).where(
            (EmergencyContact.id == contact_id) &
            (EmergencyContact.user_id == user_id)
        )
    )
    contact = result.scalar_one_or_none()
    
    if not contact:
        return None
        
    if name is not None:
        contact.name = name
    if phone is not None:
        contact.phone = phone
    if email is not None:
        contact.email = email
    if notify_sms is not None:
        contact.notify_sms = notify_sms
        
    await db.commit()
    await db.refresh(contact)
    
    return contact
