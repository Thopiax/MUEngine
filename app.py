import json
from flask import Flask, request

app = Flask(__name__)

LOGGER_SCRIPT = open("static/logger.js", "r").read()

database = {}

@app.route('/logger')
def fetch_logger():
  return LOGGER_SCRIPT

@app.route('/data')
def display_database():
  return json.dumps(database)

@app.route('/register', methods=['POST'])
def register_visit():
  payload = request.data
  app.logger.debug(payload)

  return "Success"


@app.route('/log', methods=['POST'])
def log_events():
  payload = request.form
  app.logger.debug(payload)

  for key, value in payload.items():
    database[key] = json.loads(value)

  return "Success"


@app.route('/ping')
def ping():
  app.logger.debug('working')
  return "pong"

if __name__ == '__main__':
  app.run()

