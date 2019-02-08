from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

import config


def register_blueprints(app):
    from muengine.event.controllers import event_blueprint
    from muengine.visit.controllers import visit_blueprint

    app.register_blueprint(visit_blueprint, url_prefix='/visit')
    app.register_blueprint(event_blueprint, url_prefix='/event')


app = Flask(__name__)
CORS(app)

app.config.from_object(config.CONFIG)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

register_blueprints(app)



