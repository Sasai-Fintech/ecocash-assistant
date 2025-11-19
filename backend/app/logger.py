import logging


def get_logger(name: str = "ecocash.backend") -> logging.Logger:
  logger = logging.getLogger(name)
  if logger.handlers:
    return logger
  handler = logging.StreamHandler()
  formatter = logging.Formatter(
    fmt="%(asctime)s %(levelname)s [%(name)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
  )
  handler.setFormatter(formatter)
  logger.addHandler(handler)
  logger.setLevel(logging.INFO)
  return logger

