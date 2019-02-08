
def test_fetch_logger(client):
    response = client.get('/visit/fetch_logger')

    assert response.status_code == 200
