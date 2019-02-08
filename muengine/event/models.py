from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql.functions import func

from muengine.db import db


class Event(db.Model):
    __tablename__ = 'events'

    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False, primary_key=True)
    timestamp = db.Column(db.Float, primary_key=True)
    name = db.Column(db.String(), primary_key=True)

    payload = db.Column(JSON)

    inserted_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())