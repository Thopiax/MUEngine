import os, json

import config, util

from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config.from_object(config.CONFIG)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


@app.route('/logger')
def fetch_logger():
  return util.load_logger_script()


@app.route('/register', methods=['POST'])
def register_visit():
  payload = request.get_json(True)
  app.logger.debug(payload)
  return "Success"


@app.route('/log', methods=['POST'])
def log_events():
  payload = request.get_json(True)
  app.logger.debug(payload)
  return "Success"


@app.route('/ping')
def ping():
  app.logger.debug('working')
  return "pong"

if __name__ == '__main__':
  app.run()

