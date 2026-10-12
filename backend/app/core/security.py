"""Verifies the Supabase login token the host job-application app hands over.

The editor has no login of its own: both apps share one Supabase project, so
the access token issued when the user signs in to the main app is also valid
here. This mirrors the main app's verifier (same audience, same key handling).
"""

import time

import requests
from fastapi import HTTPException, Request
from jose import JWTError, jwt

from app.core.config import settings

JWKS_CACHE_TTL_SECONDS = 3600

_jwks_cache: dict = {"keys": [], "fetched_at": 0.0}


def _fetch_jwks() -> list[dict]:
    response = requests.get(
        f"{settings.supabase_url}/auth/v1/.well-known/jwks.json", timeout=5
    )
    response.raise_for_status()
    return response.json().get("keys", [])


def _get_jwk_for_kid(kid: str, force_refresh: bool = False) -> dict | None:
    cache_is_stale = time.time() - _jwks_cache["fetched_at"] > JWKS_CACHE_TTL_SECONDS

    if force_refresh or cache_is_stale or not _jwks_cache["keys"]:
        _jwks_cache["keys"] = _fetch_jwks()
        _jwks_cache["fetched_at"] = time.time()

    for key in _jwks_cache["keys"]:
        if key.get("kid") == kid:
            return key

    return None


def _decode_token(token: str) -> dict:
    header = jwt.get_unverified_header(token)
    alg = header.get("alg")

    if alg == "HS256":
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )

    kid = header.get("kid")
    jwk = _get_jwk_for_kid(kid) if kid else None

    if jwk is None:
        # Key rotation may have happened since the JWKS was last cached.
        jwk = _get_jwk_for_kid(kid, force_refresh=True) if kid else None

    if jwk is None:
        raise JWTError(f"No matching JWKS key found for kid={kid}")

    return jwt.decode(token, jwk, algorithms=[alg], audience="authenticated")


def require_user(request: Request) -> None:
    """FastAPI dependency: reject any request without a valid login token.

    REQUIRE_AUTH=false (local standalone dev only) switches this off. That
    switch lives in the server's own environment, so nothing a browser sends
    can turn it off.
    """
    if not settings.require_auth:
        return

    if not settings.supabase_url:
        # Misconfigured production: fail closed rather than let requests in.
        raise HTTPException(status_code=500, detail="Authentication is not configured")

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.removeprefix("Bearer ").strip()

    try:
        payload = _decode_token(token)
    except JWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {exc}")
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail=f"Could not verify token against Supabase: {exc}")

    if not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Token missing subject claim")
