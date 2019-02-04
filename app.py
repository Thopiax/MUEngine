from flask import Flask, request

app = Flask(__name__)

LOGGER_SCRIPT = open("static/logger.js", "r").read()


@app.route('/logger')
def fetch_logger():
  return LOGGER_SCRIPT


@app.route('/register', methods=['POST'])
def register_visit():
  payload = request.data
  app.logger.debug(payload)
  return "Success"


@app.route('/log', methods=['POST'])
def log_events():
  payload = request.form
  app.logger.debug(payload)
  return "Success"


@app.route('/ping')
def ping():
  app.logger.debug('working')
  return "pong"

if __name__ == '__main__':
  app.run()

