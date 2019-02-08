from flask import request, Blueprint

from muengine import db
from muengine.event.models import Event

event_blueprint = Blueprint('event', __name__)

@event_blueprint.route('/log', methods=['POST'])
def log_events():
    # TODO: HANDLE ERROR
    payload = request.get_json(True)

    # TODO: HANDLE ERROR
    visit_id = int(payload["visitId"])

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