import datetime
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql.functions import func

from app import db

class Visit(db.Model):
  __tablename__ = 'visits'

  id = db.Column(db.BigInteger, primary_key=True)
  time_created = db.Column(db.DateTime(timezone=True), server_default=func.now())

  # TODO: ADD LENGTH CONSTRAINTS
  baseURI = db.Column(db.String())
  URL = db.Column(db.String())
  domain = db.Column(db.String())
  referrer = db.Column(db.String())

  user_agent = db.Column(db.String())
  screen_height = db.Column(db.Integer)
  screen_width = db.Column(db.Integer)

  initial_window_height = db.Column(db.Integer)
  initial_window_width = db.Column(db.Integer)

  events = db.relationship('Event', backref='visit', lazy='dynamic')

  def __repr__(self):
    return '<Visit #{}>'.format(self.id)

class Event(db.Model):
  __tablename__ = 'events'

  visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False, primary_key=True)
  timestamp = db.Column(db.Float, primary_key=True)
  name = db.Column(db.String(), primary_key=True)
  payload = db.Column(JSON)