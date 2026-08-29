"""
Unit Tests for Ticket T-02: Gemini Multimodal Vision Receipt Parser Tool.
Tests multimodal extraction, response cleaning, category normalization, and deterministic offline fallbacks.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import ParsedExpense, ExpenseCategory
from backend.app.agent.tools.receipt_parser import (
    parse_receipt,
    get_mock_parsed_expense,
    clean_gemini_json_response,
    normalize_expense_category,
)


class TestReceiptParserTool(unittest.TestCase):
    """Test suite for receipt parsing deep module."""

    def test_clean_gemini_json_response_plain(self):
        raw = '{"vendor": "Store A", "category": "GROCERIES", "total_amount": 100.0, "tax_amount": 5.0, "bill_date": "2026-08-29", "due_date": "2026-09-05", "items": [], "confidence_score": 0.95}'
        result = clean_gemini_json_response(raw)
        self.assertEqual(result["vendor"], "Store A")
        self.assertEqual(result["total_amount"], 100.0)

    def test_clean_gemini_json_response_with_markdown_fences(self):
        raw = """```json
{
  "vendor": "Supermarket",
  "category": "GROCERIES",
  "total_amount": 250.50,
  "tax_amount": 10.0,
  "bill_date": "2026-08-29",
  "due_date": "2026-09-05",
  "items": [],
  "confidence_score": 0.98
}
```"""
        result = clean_gemini_json_response(raw)
        self.assertEqual(result["vendor"], "Supermarket")
        self.assertEqual(result["total_amount"], 250.50)

    def test_clean_gemini_json_response_with_surrounding_text(self):
        raw = """Here is the extracted receipt data:
{
  "vendor": "Electric Co",
  "category": "ELECTRICITY",
  "total_amount": 1200.0,
  "tax_amount": 50.0,
  "bill_date": "2026-08-29",
  "due_date": "2026-09-05",
  "items": [],
  "confidence_score": 0.90
}
Hope this helps!"""
        result = clean_gemini_json_response(raw)
        self.assertEqual(result["vendor"], "Electric Co")
        self.assertEqual(result["category"], "ELECTRICITY")

    def test_normalize_expense_category(self):
        self.assertEqual(normalize_expense_category("WIFI"), ExpenseCategory.WIFI)
        self.assertEqual(normalize_expense_category("fiber broadband"), ExpenseCategory.WIFI)
        self.assertEqual(normalize_expense_category("adani power electricity"), ExpenseCategory.ELECTRICITY)
        self.assertEqual(normalize_expense_category("grocery store"), ExpenseCategory.GROCERIES)
        self.assertEqual(normalize_expense_category("monthly flat rent"), ExpenseCategory.RENT)
        self.assertEqual(normalize_expense_category("society maintenance charge"), ExpenseCategory.MAINTENANCE)
        self.assertEqual(normalize_expense_category("unknown misc"), ExpenseCategory.OTHER)

    def test_deterministic_fallback_wifi(self):
        res = get_mock_parsed_expense("sample_airtel_wifi_bill.pdf")
        self.assertIsInstance(res, ParsedExpense)
        self.assertEqual(res.category, ExpenseCategory.WIFI)
        self.assertEqual(res.vendor, "Airtel Xstream Fiber")
        self.assertEqual(res.total_amount, 1199.00)
        self.assertTrue(len(res.items) > 0)

    def test_deterministic_fallback_electricity(self):
        res = get_mock_parsed_expense("adani_elec_invoice.jpg")
        self.assertIsInstance(res, ParsedExpense)
        self.assertEqual(res.category, ExpenseCategory.ELECTRICITY)
        self.assertEqual(res.vendor, "Adani Electricity Mumbai Ltd")
        self.assertEqual(res.total_amount, 2450.00)

    def test_deterministic_fallback_rent(self):
        res = get_mock_parsed_expense("flat_rent_agreement.png")
        self.assertIsInstance(res, ParsedExpense)
        self.assertEqual(res.category, ExpenseCategory.RENT)
        self.assertEqual(res.vendor, "Palm Grove Property Management")
        self.assertEqual(res.total_amount, 60000.00)

    def test_deterministic_fallback_groceries_default(self):
        res = get_mock_parsed_expense("grocery_receipt.jpg")
        self.assertIsInstance(res, ParsedExpense)
        self.assertEqual(res.category, ExpenseCategory.GROCERIES)
        self.assertEqual(res.vendor, "Nature's Basket Supermarket")
        self.assertEqual(res.total_amount, 3280.50)

    def test_parse_receipt_offline_or_empty_bytes(self):
        # Empty bytes should return fallback without crashing
        res = parse_receipt(b"", filename="sample_wifi.pdf")
        self.assertIsInstance(res, ParsedExpense)
        self.assertEqual(res.category, ExpenseCategory.WIFI)

    @patch("backend.app.agent.tools.receipt_parser.HAS_GENAI", True)
    @patch.dict(os.environ, {"GEMINI_API_KEY": "fake_test_key", "MOCK_GEMINI": "false"})
    @patch("backend.app.agent.tools.receipt_parser.genai")
    def test_parse_receipt_with_mocked_gemini_sdk(self, mock_genai):
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = """```json
{
  "vendor": "Test Coffee Shop",
  "category": "GROCERIES",
  "total_amount": 450.0,
  "tax_amount": 25.0,
  "bill_date": "2026-08-29",
  "due_date": "2026-08-30",
  "items": [
    {"name": "Cappuccino", "amount": 200.0, "category": "BEVERAGE"},
    {"name": "Croissant", "amount": 250.0, "category": "FOOD"}
  ],
  "confidence_score": 0.97
}
```"""
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        fake_image_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF"
        result = parse_receipt(fake_image_bytes, mime_type="image/jpeg", filename="receipt.jpg")

        self.assertIsInstance(result, ParsedExpense)
        self.assertEqual(result.vendor, "Test Coffee Shop")
        self.assertEqual(result.total_amount, 450.0)
        self.assertEqual(result.category, ExpenseCategory.GROCERIES)
        self.assertEqual(len(result.items), 2)
        self.assertEqual(result.confidence_score, 0.97)


if __name__ == "__main__":
    unittest.main()
