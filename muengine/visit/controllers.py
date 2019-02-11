import datetime

from flask import Blueprint, request, current_app
from sqlalchemy import exc

from muengine import db, util
from muengine.visit.models import Visit


visit_blueprint = Blueprint('visit', __name__)


@visit_blueprint.route('/logger', methods=['GET'])
def logger():
    logger = util.load_logger_script()
    visit = Visit()

    db.session.add(visit)
    db.session.commit()

    return util.respond_with_success(status_code=200, payload=(logger % visit.id), content_type="application/javascript")


@visit_blueprint.route('/register', methods=['POST'])
def register():
    payload = request.get_json(True)

    print(payload)
    print("VISIT_ID=" + payload["visitId"])
    # TODO: HANDLE ERROR
    visit = Visit.query.get(payload["visitId"])

    data = payload["data"]

    visit.baseURI = data.get("baseURI", "")
    visit.URL = data.get("URL", "")
    visit.domain = data.get("domain", "")
    visit.referrer = data.get("referrer", "")

    visit.user_agent = data.get("userAgent", "")

    try:
        visit.navigation_start = datetime.datetime.fromtimestamp(int(data.get("navigationStart", "")) / 1000.0)

        # TODO: HANDLE ERROR
        visit.screen_height = int(data.get("screenHeight", ""))
        visit.screen_width = int(data.get("screenWidth", ""))

        visit.initial_window_height = int(data.get("windowHeight", ""))
        visit.initial_window_width = int(data.get("windowWidth", ""))

        db.session.commit()
    except ValueError:
        return util.respond_with_error()
    except exc.SQLAlchemyError as err:
        current_app.logger.error("[/visit/register] Error when committing to database", error=err, request=request)


    return util.respond_with_success()
