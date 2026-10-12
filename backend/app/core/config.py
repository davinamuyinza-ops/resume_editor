from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_ENV_FILE, extra="ignore")

    openai_api_key: str

    # Same Supabase project as the host job-application app, so its login
    # tokens are accepted here. Protected unless REQUIRE_AUTH=false is set
    # explicitly (local standalone dev only).
    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    require_auth: bool = True

    cors_origins: list[str] = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ]


settings = Settings()
