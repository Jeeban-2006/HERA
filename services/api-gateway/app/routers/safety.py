"""Safety routes router endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.safety import RouteRequest, RouteResponse, SOSRequest, SOSResponse, ContactRequest, ContactResponse, UpdateContactRequest
from app.dependencies import get_db, get_current_user
from app.models import User
from app.services.safety_service import analyze_route, trigger_sos, get_emergency_contacts, add_emergency_contact, delete_emergency_contact, update_emergency_contact
from app.services.audit import write_audit_log
from app.middleware.rate_limit import limiter
from app.monitoring import sos_events_total
from uuid import UUID

router = APIRouter()


@router.post("/route", response_model=RouteResponse)
@limiter.limit("5/minute")
async def analyze_safe_route(
    request: Request,
    body: RouteRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Analyze route safety and get safest/fastest options."""
    return await analyze_route(db, user.id, body)


@router.post("/sos", response_model=SOSResponse, status_code=201)
async def trigger_emergency_sos(
    request: Request,
    body: SOSRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Trigger SOS emergency alert (NO rate limit - safety critical)."""
    sos_events_total.inc()  # Prometheus counter
    result = await trigger_sos(db, user.id, body)
    await write_audit_log(
        db,
        accessor_user_id=str(user.id),
        target_user_id=str(user.id),
        resource_type="sos_event",
        action="write",
        resource_id=str(result.event_id),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        extra={"contacts_notified": result.contacts_notified},
    )
    return result


@router.get("/contacts", response_model=list[ContactResponse])
async def list_contacts(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get user's emergency contacts."""
    contacts = await get_emergency_contacts(db, user.id)
    return [ContactResponse.model_validate(c) for c in contacts]


@router.post("/contacts", response_model=ContactResponse, status_code=201)
@limiter.limit("10/minute")
async def create_contact(
    request: Request,
    body: ContactRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Add new emergency contact (max 5)."""
    contact = await add_emergency_contact(
        db, user.id, body.name, body.phone, body.email, body.notify_sms
    )
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 contacts allowed"
        )
    
    return ContactResponse.model_validate(contact)


@router.delete("/contacts/{contact_id}", status_code=204)
async def remove_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete emergency contact."""
    try:
        contact_uuid = UUID(contact_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid contact ID format"
        )
    
    contact = await delete_emergency_contact(db, user.id, contact_uuid)
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    return None


@router.patch("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: str,
    body: UpdateContactRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update an existing emergency contact."""
    try:
        contact_uuid = UUID(contact_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid contact ID format"
        )
    
    contact = await update_emergency_contact(
        db=db,
        user_id=user.id,
        contact_id=contact_uuid,
        name=body.name,
        phone=body.phone,
        email=body.email,
        notify_sms=body.notify_sms
    )
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
        
    return ContactResponse.model_validate(contact)

