import importlib.util
from pathlib import Path

import pytest

SPEC = importlib.util.spec_from_file_location(
  "dummy_wallet_server", Path(__file__).resolve().parents[1] / "mcp" / "dummy_wallet_server.py"
)
wallet_server = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(wallet_server)


@pytest.mark.asyncio
async def test_dummy_mcp_balances():
  result = await wallet_server.get_balances.fn("retail-123")
  assert result["user_id"] == "retail-123"
  assert len(result["accounts"]) >= 1


@pytest.mark.asyncio
async def test_dummy_mcp_ticket_status():
  result = await wallet_server.get_ticket_status.fn("retail-123")
  assert result["user_id"] == "retail-123"
  assert isinstance(result["tickets"], list)

