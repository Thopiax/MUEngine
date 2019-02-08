import os
import tempfile

import pytest


@pytest.fixture
def client():
    db_fd, src.config['DATABASE'] = tempfile.mkstemp()
    src.config['TESTING'] = True
    client = flaskr.app.test_client()

    with flaskr.app.app_context():
        flaskr.init_db()

    yield client

    os.close(db_fd)
    os.unlink(flaskr.app.config['DATABASE'])