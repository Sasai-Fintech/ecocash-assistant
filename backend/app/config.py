from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


CONFIG_ROOT = Path(__file__).resolve().parents[2] / "configs"


class Settings(BaseSettings):
  model_config = SettingsConfigDict(
    env_prefix="",
    env_file=CONFIG_ROOT / ".env",
    env_file_encoding="utf-8",
    extra="allow",
  )

  environment: Literal["development", "test", "production"] = "development"
  port: int = 8000

  mongodb_uri: str = Field(default="mongodb://localhost:27017/ecocash-assist")
  mongodb_db_name: str = "ecocash-assistance-agent"

  agno_model_id: str = "gpt-5-mini"
  agno_app_id: str = "eco_assist"
  agno_app_name: str = "Eco Assist"
  agno_app_description: str = "Ecocash relationship manager agent"

  use_in_memory_db: bool = False


@lru_cache
def get_settings() -> Settings:
  return Settings()  # type: ignore[arg-type]

