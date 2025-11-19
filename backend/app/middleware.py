from typing import Optional

from fastapi import Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware


class MobileTokenMiddleware(BaseHTTPMiddleware):
  """
  Captures the mobile JWT from the Authorization header and stores it on
  request.state so the agent (and downstream MCP calls) can forward it.
  No validation or signature checks are performed.
  """

  def __init__(self, app, header_key: str = "Authorization"):
    super().__init__(app)
    self.header_key = header_key

  def _extract_token(self, request: Request) -> Optional[str]:
    auth = request.headers.get(self.header_key)
    if not auth:
      return None
    parts = auth.split(" ", 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
      return parts[1].strip()
    return auth.strip()

  async def dispatch(self, request: Request, call_next):
    token = self._extract_token(request)
    request.state.mobile_token = token
    if token:
      deps = getattr(request.state, "dependencies", {}) or {}
      deps["mobile_token"] = token
      request.state.dependencies = deps
    response: Response = await call_next(request)
    return response


def register_mobile_token_middleware(app):
  app.add_middleware(MobileTokenMiddleware)

