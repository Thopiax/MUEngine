import datetime

from flask import Blueprint, request

from muengine import db
from muengine.util import load_logger_script
from muengine.visit.models import Visit


visit_blueprint = Blueprint('visit', __name__)


@visit_blueprint.route('/fetch_logger', methods=['GET'])
def fetch_logger():
    logger = load_logger_script()
    visit = Visit()

    db.session.add(visit)
    db.session.commit()

    return logger % visit.id


@visit_blueprint.route('/register', methods=['POST'])
def register():
    payload = request.get_json(True)

    # TODO: HANDLE ERROR
    visit = Visit.query.get(payload["visitId"])

    data = payload["data"]

    visit.baseURI = data["baseURI"]
    visit.URL = data["URL"]
    visit.domain = data["domain"]
    visit.referrer = data["referrer"]

    visit.user_agent = data["userAgent"]

    visit.navigation_start = datetime.datetime.fromtimestamp(int(data["navigationStart"]) / 1000.0)

    # TODO: HANDLE ERROR
    visit.screen_height = int(data["screenHeight"])
    visit.screen_width = int(data["screenWidth"])

    visit.initial_window_height = int(data["windowHeight"])
    visit.initial_window_width = int(data["windowWidth"])

    db.session.commit()

    return "Success"
