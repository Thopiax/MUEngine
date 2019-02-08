from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine

import config

db = SQLAlchemy()
db_engine = create_engine(config.CONFIG.SQLALCHEMY_DATABASE_URI)