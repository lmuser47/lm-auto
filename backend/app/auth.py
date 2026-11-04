import os
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer = HTTPBearer(auto_error=False)


def verified_user(token: str) -> dict:
    """Validate the access token with this project's Supabase Auth server."""
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SECRET_KEY", "")
    if not url or not key:
        raise HTTPException(503, "Authentication is not configured.")
    try:
        response = httpx.get(
            f"{url}/auth/v1/user",
            headers={"apikey": key, "Authorization": f"Bearer {token}"},
            timeout=10,
        )
    except httpx.RequestError as exc:
        raise HTTPException(503, "Authentication service unavailable. Please retry.") from exc
    if response.status_code in (401, 403):
        raise HTTPException(401, "Session expired or invalid. Please sign in again.", headers={"WWW-Authenticate": "Bearer"})
    if response.status_code != 200:
        raise HTTPException(503, "Authentication service unavailable. Please retry.")
    try:
        user = response.json()
        UUID(user["id"])
    except (ValueError, TypeError, KeyError) as exc:
        raise HTTPException(503, "Authentication service returned an invalid response.") from exc
    return user


def require_owner(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if credentials is None:
        raise HTTPException(401, "Please sign in.", headers={"WWW-Authenticate": "Bearer"})
    # Fail closed until the approved account is explicitly configured.
    try:
        owner_id = str(UUID(os.getenv("OWNER_USER_ID", "")))
    except ValueError as exc:
        raise HTTPException(503, "Owner access is not configured.") from exc
    user = verified_user(credentials.credentials)
    if str(UUID(user["id"])) != owner_id:
        raise HTTPException(403, "This account does not have owner access.")
    return {"id": user["id"], "email": user.get("email")}
