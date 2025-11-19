from agent.mongo import build_mongo_db
from agno.db.in_memory import InMemoryDb
from app.config import get_settings


def test_build_mongo_db_in_memory(monkeypatch):
  monkeypatch.setenv("USE_IN_MEMORY_DB", "true")
  get_settings.cache_clear()
  db = build_mongo_db()
  assert isinstance(db, InMemoryDb)

