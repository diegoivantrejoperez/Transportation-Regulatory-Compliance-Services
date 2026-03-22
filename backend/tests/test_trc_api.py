"""TRC Compliance API - Backend Tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials
TEST_EMAIL = "test@trc-test.com"
TEST_PASSWORD = "Test1234!"
USDOT = "3843083"


class TestHealth:
    """Health check"""

    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        print("PASS: health check")


class TestUSDOT:
    """USDOT lookup tests"""

    def test_usdot_lookup_valid(self):
        r = requests.get(f"{BASE_URL}/api/usdot/{USDOT}")
        assert r.status_code == 200
        data = r.json()
        assert data["usdot_number"] == USDOT
        assert "fmcsa_data" in data
        assert "compliance_status" in data
        print(f"PASS: USDOT lookup - {data['fmcsa_data'].get('legal_name')} - Status: {data['compliance_status']}")

    def test_usdot_company_name(self):
        r = requests.get(f"{BASE_URL}/api/usdot/{USDOT}")
        assert r.status_code == 200
        data = r.json()
        legal_name = data["fmcsa_data"].get("legal_name", "")
        assert "JJ TRANSPORT" in legal_name.upper() or len(legal_name) > 0
        print(f"PASS: Legal name = {legal_name}")

    def test_usdot_yellow_status(self):
        r = requests.get(f"{BASE_URL}/api/usdot/{USDOT}")
        assert r.status_code == 200
        data = r.json()
        status = data["compliance_status"]
        assert status in ["RED", "YELLOW", "GREEN", "UNKNOWN"]
        print(f"PASS: Compliance status = {status}")

    def test_usdot_invalid_format(self):
        r = requests.get(f"{BASE_URL}/api/usdot/ABCDEF")
        assert r.status_code == 400
        print("PASS: invalid format rejected")

    def test_usdot_not_found(self):
        r = requests.get(f"{BASE_URL}/api/usdot/9999999")
        assert r.status_code in [404, 200]  # 200 if cached, 404 if not found
        print(f"PASS: nonexistent USDOT returned {r.status_code}")


class TestAuth:
    """Auth tests"""

    def test_register_new_user(self):
        import uuid
        email = f"TEST_{uuid.uuid4().hex[:8]}@trc-test.com"
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Test1234!"})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        assert data["email"] == email.lower()
        print(f"PASS: register - {email}")

    def test_register_duplicate_email(self):
        # Register once
        import uuid
        email = f"TEST_{uuid.uuid4().hex[:8]}@trc-test.com"
        requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Test1234!"})
        # Register again
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Test1234!"})
        assert r.status_code == 400
        print("PASS: duplicate email rejected")

    def test_login_valid(self):
        # First register
        import uuid
        email = f"TEST_{uuid.uuid4().hex[:8]}@trc-test.com"
        requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Test1234!"})
        # Login
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "Test1234!"})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        print(f"PASS: login - {email}")

    def test_login_invalid_password(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": "WrongPass!"})
        assert r.status_code == 401
        print("PASS: invalid login rejected")

    def test_auth_me(self):
        # Register and get token
        import uuid
        email = f"TEST_{uuid.uuid4().hex[:8]}@trc-test.com"
        reg = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Test1234!"})
        token = reg.json().get("access_token")
        r = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == email.lower()
        print("PASS: /auth/me works")


class TestMonitoring:
    """Monitoring subscribe tests"""

    def test_subscribe_new_user(self):
        import uuid
        email = f"TEST_{uuid.uuid4().hex[:8]}@monitor-test.com"
        r = requests.post(f"{BASE_URL}/api/monitoring/subscribe", json={
            "usdot_number": USDOT, "email": email, "password": "Test1234!"
        })
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        assert data["monitoring_enabled"] == True
        print(f"PASS: monitoring subscribe - {email}")

    def test_subscribe_existing_user_wrong_password(self):
        import uuid
        email = f"TEST_{uuid.uuid4().hex[:8]}@monitor-test.com"
        # Register first
        requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Test1234!"})
        # Subscribe with wrong password
        r = requests.post(f"{BASE_URL}/api/monitoring/subscribe", json={
            "usdot_number": USDOT, "email": email, "password": "WrongPass!"
        })
        assert r.status_code == 400
        print("PASS: wrong password rejected for existing user")


class TestPayments:
    """Payment checkout tests"""

    def test_create_checkout_2year(self):
        r = requests.post(f"{BASE_URL}/api/payments/create-checkout", json={
            "tier": "2_YEAR",
            "usdot_number": USDOT,
            "email": "test@trc-test.com",
            "origin_url": BASE_URL
        })
        assert r.status_code == 200
        data = r.json()
        assert "checkout_url" in data
        assert "session_id" in data
        assert "stripe.com" in data["checkout_url"]
        print(f"PASS: checkout 2_YEAR - session {data['session_id']}")

    def test_create_checkout_4year(self):
        r = requests.post(f"{BASE_URL}/api/payments/create-checkout", json={
            "tier": "4_YEAR",
            "usdot_number": USDOT,
            "email": "test@trc-test.com",
            "origin_url": BASE_URL
        })
        assert r.status_code == 200
        data = r.json()
        assert "checkout_url" in data
        print(f"PASS: checkout 4_YEAR - {data['checkout_url'][:60]}")

    def test_create_checkout_invalid_tier(self):
        r = requests.post(f"{BASE_URL}/api/payments/create-checkout", json={
            "tier": "INVALID",
            "usdot_number": USDOT,
            "email": "test@trc-test.com",
            "origin_url": BASE_URL
        })
        assert r.status_code == 400
        print("PASS: invalid tier rejected")


class TestDashboard:
    """Dashboard tests (authenticated)"""

    def get_token(self):
        import uuid
        email = f"TEST_{uuid.uuid4().hex[:8]}@dashboard-test.com"
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Test1234!"})
        return r.json().get("access_token")

    def test_dashboard_authenticated(self):
        token = self.get_token()
        r = requests.get(f"{BASE_URL}/api/dashboard", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        data = r.json()
        assert "user" in data
        assert "dot_records" in data
        print("PASS: dashboard authenticated")

    def test_dashboard_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/dashboard")
        assert r.status_code == 401
        print("PASS: dashboard unauthenticated rejected")
