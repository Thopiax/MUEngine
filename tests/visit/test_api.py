import json

from sqlalchemy import exc

from muengine.db import db

def test_visit_logger_success(mocker, client):
    mocker.spy(db.session, 'add')
    mocker.spy(db.session, 'commit')
    response = client.get('/visit/logger')

    assert response.status_code == 200
    assert db.session.add.call_count == 1
    assert db.session.commit.call_count == 1

VISIT_REGISTER_PAYLOAD = dict(
    visitId="1",
    data=dict(
        baseURI="www.example.com",
        URL="www.example.com/foo/bar?suh=dude",
        domain="www.example.com",
        referrer= "",
        userAgent="User Agent",
        navigationStart=12345678983,
        screenHeight=900,
        screenWidth=1600,
        windowHeight=900,
        windowWidth=1600,
    )
)


def test_visit_register_good_request(mocker, client):
    mocker.spy(db.session, 'commit')

    response = client.post('/visit/register', data=json.dumps(VISIT_REGISTER_PAYLOAD))

    assert response.status_code == 201
    assert response.get_json() == {"status": "success"}
    assert response.content_type == "application/json"
    assert db.session.commit.call_count == 1


# def test_visit_register_db_failure(mocker, client):
#     mocked_commit = mocker.stub(db.session)
#     mocked_commit.side_effect = exc.SQLAlchemyError()
#
#     response = client.post('/visit/register', data=json.dumps(VISIT_REGISTER_PAYLOAD))
#
#     assert response.status_code == 400
#     assert response.get_json() == {"status": "error"}
#     assert response.content_type == "application/json"
#     assert mocked_commit.call_count == 0


def test_visit_register_wrong_data_types(mocker, client):
    mocker.spy(db.session, 'commit')

    payload = dict(
        visitId="1",
        data=dict(
            baseURI="www.example.com",
            URL="www.example.com/foo/bar?suh=dude",
            domain="www.example.com",
            referrer= "",
            userAgent="User Agent",
            navigationStart="BAD TYPE",
            screenHeight="BAD TYPE",
            screenWidth="BAD TYPE",
            windowHeight="BAD TYPE",
            windowWidth="BAD TYPE",
        )
    )

    response = client.post('/visit/register', data=json.dumps(payload))

    assert response.status_code == 400
    assert db.session.commit.call_count == 0


def test_visit_register_bad_request(mocker, client):
    mocker.spy(db.session, 'commit')
    response = client.post('/visit/register', data=None)

    assert response.status_code == 400
    assert db.session.commit.call_count == 0
