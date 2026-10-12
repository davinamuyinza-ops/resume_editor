import os

# Tests must never use the real OpenAI key or the real .env. Environment
# variables beat the .env file in pydantic-settings, so set them first.
os.environ["OPENAI_API_KEY"] = "test-key-not-real"
os.environ["SUPABASE_URL"] = "https://test-project.supabase.co"
os.environ["SUPABASE_JWT_SECRET"] = "test-jwt-secret-for-unit-tests-only-0123456789"
os.environ["REQUIRE_AUTH"] = "true"

import time  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from jose import jwt  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.main import app  # noqa: E402


class FakeAiResponse:
    def __init__(self, text: str):
        self.output_text = text


class FakeOpenAiClient:
    """Stands in for the OpenAI client; records every call it receives."""

    def __init__(self, reply: str):
        self.reply = reply
        self.calls = []
        self.responses = self

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return FakeAiResponse(self.reply)


def make_token(**overrides) -> str:
    claims = {"sub": "user-1", "aud": "authenticated", "exp": int(time.time()) + 600}
    claims.update(overrides)
    return jwt.encode(claims, settings.supabase_jwt_secret, algorithm="HS256")


@pytest.fixture(autouse=True)
def no_real_ai_calls(monkeypatch):
    """Every test gets a harmless fake AI client, so nothing can ever reach
    (or bill) the real OpenAI API by accident."""
    from app.services import ats_check

    monkeypatch.setattr(ats_check, "client", FakeOpenAiClient("fake AI report"))


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers():
    return {"Authorization": f"Bearer {make_token()}"}


@pytest.fixture
def good_resume():
    """A resume that triggers none of the ATS rules."""
    return {
        "basics": {"email": "jo@example.com", "phone": "+1 555 0100"},
        "picture": {"hidden": True},
        "sections": {
            "experience": {"title": "Experience", "items": [{"id": "e1", "description": "<p>Built things</p>"}]},
            "education": {"title": "Education", "items": []},
        },
        "metadata": {"template": "classic", "fontFamily": "Arial"},
    }
