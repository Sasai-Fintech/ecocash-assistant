import os
import sys
import time
from pathlib import Path

import jwt
import pytest
from fastapi import Request
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
  sys.path.insert(0, str(ROOT_DIR))

# Test environment configuration
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("PORT", "9999")
os.environ.setdefault("USE_IN_MEMORY_DB", "true")
os.environ.setdefault("OPENAI_API_KEY", "test-key")
os.environ.setdefault("AGNO_MODEL_ID", "gpt-5-mini")

from app.main import app  # noqa: E402


@app.get("/__test/token")
def read_token(request: Request):
  return {"token": getattr(request.state, "mobile_token", None)}


@pytest.fixture(scope="session")
def client() -> TestClient:
  return TestClient(app)


@pytest.fixture
def auth_header() -> dict:
  payload = {
    "sub": "user-test",
    "sid": "session-test",
    "scope": "wallet:read",
    "exp": int(time.time()) + 3600,
  }
  token = jwt.encode(payload, "test-secret", algorithm="HS256")
  return {"Authorization": f"Bearer {token}"}

