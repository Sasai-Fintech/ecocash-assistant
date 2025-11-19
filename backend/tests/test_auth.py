def test_health_accessible_without_jwt(client):
  resp = client.get("/health")
  assert resp.status_code == 200
  assert resp.json()["status"] == "ok"


def test_mobile_token_forwarded(client, auth_header):
  resp = client.get("/__test/token", headers=auth_header)
  assert resp.status_code == 200
  assert resp.json()["token"] is not None

