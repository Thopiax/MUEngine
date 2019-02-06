import os, json, util

from flask import Flask, request
from flask.ext.sqlalchemy import SQLAlchemy
from flask_cors import CORS

LOGGER_SCRIPT = util.load_logger_script()

app = Flask(__name__)
CORS(app)
app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


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

