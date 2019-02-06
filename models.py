from app import db
from sqlalchemy.dialects.postgresql import JSON

class Events(db.Model):
  __tablename__ = 'events'

  id = db.Column(db.Integer, primary_key=True)
  timestamp = db.Column(db.Time())