from typing import Optional

from pymongo import MongoClient

from .config import get_settings
from .logger import get_logger

settings = get_settings()
logger = get_logger(__name__)

_client: Optional[MongoClient] = None


def get_client() -> MongoClient:
  global _client
  if _client is None:
    logger.info("Connecting to MongoDB at %s", settings.mongodb_uri)
    _client = MongoClient(settings.mongodb_uri)
  return _client


def get_db():
  return get_client()[settings.mongodb_db_name]


def close_client():
  global _client
  if _client is not None:
    logger.info("Closing MongoDB connection")
    _client.close()
    _client = None

