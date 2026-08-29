"""
FastAPI REST Route Integration Tests.
Verifies health, expense ingestion, preset bills, payments, time travel, and debt simplification.
"""

import sys
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


class TestApiRoutes(unittest.TestCase):

    def test_health_endpoint(self):
        res = client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "online")
        self.assertTrue(data["cloud_run_ready"])

    def test_get_household(self):
        res = client.get("/api/households/hh_palm_grove_402")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["id"], "hh_palm_grove_402")
        self.assertEqual(len(data["roommates"]), 4)

    def test_preset_bill_ingestion(self):
        res = client.post("/api/expenses/preset", json={
            "household_id": "hh_palm_grove_402",
            "preset_type": "wifi",
            "payer_id": "rm_alex",
            "split_rule": "EQUAL"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["vendor"], "Airtel Xstream Fiber")
        self.assertEqual(data["total_amount"], 1199.00)
        self.assertEqual(len(data["shares"]), 4)

    def test_time_travel_simulation(self):
        res = client.post("/api/agent/simulate-days", json={
            "household_id": "hh_palm_grove_402",
            "days_forward": 3
        })
        self.assertEqual(res.status_code, 200)
        logs = res.json()
        self.assertIsInstance(logs, list)

    def test_debt_simplification_endpoint(self):
        res = client.get("/api/debts/simplify?household_id=hh_palm_grove_402")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("settlements", data)
        self.assertIn("simplified_transfers_count", data)

    def test_payment_confirmation_route(self):
        # Create an expense first
        exp_res = client.post("/api/expenses/preset", json={
            "household_id": "hh_palm_grove_402",
            "preset_type": "wifi",
            "payer_id": "rm_alex",
            "split_rule": "EQUAL"
        })
        self.assertEqual(exp_res.status_code, 200)
        expense = exp_res.json()
        unpaid_share = next(s for s in expense["shares"] if s["roommate_id"] != "rm_alex")
        
        # Confirm payment
        res = client.post("/api/payments/confirm", json={
            "split_share_id": unpaid_share["id"],
            "payment_ref": "UPI/TEST_CONFIRM"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["split_share"]["status"], "PAID")

    def test_debt_settlement_route(self):
        # Settle a debt between two roommates
        res = client.post("/api/debts/settle", json={
            "household_id": "hh_palm_grove_402",
            "from_roommate_id": "rm_sarah",
            "to_roommate_id": "rm_alex",
            "amount": 250.00,
            "payment_ref": "UPI/SETTLE_TEST"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("message", data)


    def test_agent_pulse_endpoint(self):
        res = client.post("/api/agent/pulse?household_id=hh_palm_grove_402")
        self.assertEqual(res.status_code, 200)
        logs = res.json()
        self.assertIsInstance(logs, list)

    def test_agent_activity_feed_endpoint(self):
        res = client.get("/api/agent/activity?household_id=hh_palm_grove_402&limit=10")
        self.assertEqual(res.status_code, 200)
        logs = res.json()
        self.assertIsInstance(logs, list)

    def test_create_expense_endpoint(self):
        res = client.post("/api/expenses", json={
            "household_id": "hh_palm_grove_402",
            "payer_id": "rm_alex",
            "vendor": "Corner Grocery Store",
            "category": "GROCERIES",
            "total_amount": 800.0,
            "tax_amount": 40.0,
            "split_rule": "EQUAL"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["vendor"], "Corner Grocery Store")
        self.assertEqual(len(data["shares"]), 4)

    def test_list_expenses_endpoint(self):
        res = client.get("/api/expenses?household_id=hh_palm_grove_402")
        self.assertEqual(res.status_code, 200)
        expenses = res.json()
        self.assertIsInstance(expenses, list)
        self.assertGreater(len(expenses), 0)

    def test_parse_expense_receipt_endpoint(self):
        # Test multipart file upload fallback
        files = {"file": ("test_receipt.jpg", b"fake image bytes", "image/jpeg")}
        res = client.post("/api/expenses/parse", files=files)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("vendor", data)
        self.assertIn("total_amount", data)
        self.assertIn("category", data)


if __name__ == "__main__":
    unittest.main()

