from agno.db.mongo import MongoDb
from agno.db.in_memory import InMemoryDb

from app.config import get_settings


def build_mongo_db():
  settings = get_settings()
  if getattr(settings, "use_in_memory_db", False):
    return InMemoryDb()
  return MongoDb(db_url=settings.mongodb_uri, db_name=settings.mongodb_db_name)

