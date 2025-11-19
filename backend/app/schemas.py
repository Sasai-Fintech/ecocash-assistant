from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class SessionStartRequest(BaseModel):
  mobileToken: str
  metadata: Optional[Dict[str, Any]] = None


class SessionResponse(BaseModel):
  sessionId: str = Field(alias="sessionId")
  userId: str
  expiresAt: datetime

  class Config:
    populate_by_name = True

