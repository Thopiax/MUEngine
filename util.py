import uuid

LOGGER_SCRIPT = open("static/logger.js", "r").read()

def load_logger_script():
  return LOGGER_SCRIPT % str(uuid.uuid1())