import datetime

import config, util

from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config.from_object(config.CONFIG)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

from models import Visit, Event

@app.route('/logger')
def fetch_logger():
    logger = util.load_logger_script()
    visit = Visit()

    db.session.add(visit)
    db.session.commit()

    return logger % visit.id


@app.route('/register', methods=['POST'])
def register_visit():
    payload = request.get_json(True)

    # TODO: HANDLE ERROR
    visit = Visit.query.get(payload["visitId"])

    data = payload["data"]

    visit.baseURI = data["baseURI"]
    visit.URL = data["URL"]
    visit.domain = data["domain"]
    visit.referrer = data["referrer"]

    visit.user_agent = data["userAgent"]

    visit.navigation_start = datetime.datetime.fromtimestamp(int(data["navigationStart"])/1000.0)

    # TODO: HANDLE ERROR
    visit.screen_height = int(data["screenHeight"])
    visit.screen_width = int(data["screenWidth"])

    visit.initial_window_height = int(data["windowHeight"])
    visit.initial_window_width = int(data["windowWidth"])

    db.session.commit()

    return "Success"


@app.route('/log', methods=['POST'])
def log_events():
    # TODO: HANDLE ERROR
    payload = request.get_json(True)

    # TODO: HANDLE ERROR
    visit_id = int(payload["visitId"])

    app.logger.debug(payload["data"])

    # TODO: HANDLE ERROR
    for event_struct in payload["data"]:
      event = Event(
        visit_id=visit_id,
        timestamp=float(event_struct["timestamp"]),
        name=event_struct["name"],
        payload=event_struct.get("payload")
      )

      db.session.add(event)

    db.session.commit()

    return "Success"


if __name__ == '__main__':
    app.run()

