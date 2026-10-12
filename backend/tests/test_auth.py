import pytest

from app.core.config import settings
from tests.conftest import make_token

PROTECTED = ["/render-preview", "/export-pdf", "/ats-check", "/suggest-fix"]
BODY = {"resume_json": {}, "finding_id": "x", "finding_message": "x"}


@pytest.mark.parametrize("path", PROTECTED)
def test_protected_routes_reject_requests_without_a_token(client, path):
    assert client.post(path, json=BODY).status_code == 401


@pytest.mark.parametrize("path", PROTECTED)
def test_protected_routes_reject_a_garbage_token(client, path):
    response = client.post(path, json=BODY, headers={"Authorization": "Bearer not.a.token"})
    assert response.status_code == 401


def test_health_stays_open(client):
    assert client.get("/health").status_code == 200


def test_expired_token_is_rejected(client):
    token = make_token(exp=1)
    response = client.post("/ats-check", json=BODY, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_token_for_the_wrong_audience_is_rejected(client):
    token = make_token(aud="something-else")
    response = client.post("/ats-check", json=BODY, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_token_without_a_subject_is_rejected(client):
    import time
    from jose import jwt

    token = jwt.encode(
        {"aud": "authenticated", "exp": int(time.time()) + 600},
        settings.supabase_jwt_secret,
        algorithm="HS256",
    )
    response = client.post("/ats-check", json=BODY, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_token_signed_with_the_wrong_secret_is_rejected(client):
    import time
    from jose import jwt

    forged = jwt.encode(
        {"sub": "attacker", "aud": "authenticated", "exp": int(time.time()) + 600},
        "some-other-secret",
        algorithm="HS256",
    )
    response = client.post("/ats-check", json=BODY, headers={"Authorization": f"Bearer {forged}"})
    assert response.status_code == 401


def test_a_valid_token_gets_through_the_gate(client, auth_headers):
    # The valid token must pass authentication (reaching request validation
    # or the route itself, never a 401).
    response = client.post("/ats-check", json={"resume_json": {}}, headers=auth_headers)
    assert response.status_code == 200
    assert "findings" in response.json()


def test_auth_can_be_switched_off_only_by_server_settings(client, monkeypatch):
    monkeypatch.setattr(settings, "require_auth", False)
    assert client.post("/ats-check", json={"resume_json": {}}).status_code == 200


def test_missing_supabase_config_fails_closed(client, monkeypatch):
    monkeypatch.setattr(settings, "supabase_url", "")
    response = client.post("/ats-check", json=BODY, headers={"Authorization": f"Bearer {make_token()}"})
    assert response.status_code == 500
