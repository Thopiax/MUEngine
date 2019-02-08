import os
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

from muengine import app, db


app.config.from_object(os.getenv('APP_SETTINGS'))

MIGRATION_DIR = os.path.join('muengine/db', 'migrations')

migrate = Migrate(app, db, directory=MIGRATION_DIR)
manager = Manager(app)

manager.add_command('db', MigrateCommand)


if __name__ == '__main__':
    manager.run()