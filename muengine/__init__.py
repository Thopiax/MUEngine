from flask import Flask
from flask_cors import CORS

import config
from muengine.db import db

from muengine.event.controllers import event_blueprint
from muengine.visit.controllers import visit_blueprint

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config.from_object(config.CONFIG)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    app.register_blueprint(visit_blueprint, url_prefix='/visit')
    app.register_blueprint(event_blueprint, url_prefix='/event')

    return app


