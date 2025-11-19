import uvicorn

from .factory import create_app
from .config import get_settings

app = create_app()


def run():
  settings = get_settings()
  uvicorn.run(
    "app.main:app",
    host="0.0.0.0",
    port=settings.port,
    reload=settings.environment == "development",
  )


if __name__ == "__main__":
  run()

