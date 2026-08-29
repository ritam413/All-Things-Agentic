"""
Unit Tests for Ticket T-07: UPI Deep Link & Base64 QR Code Generator Tool.
Strict TDD tests validating RFC UPI URI compliance, parameter URL encoding,
base64 PNG QR rasterization, and missing-library fallback resilience.
"""

import sys
import unittest
import base64
from unittest.mock import patch
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import PaymentIntent
from backend.app.agent.tools.payment_links import (
    generate_upi_deep_link,
    generate_qr_base64,
    create_payment_intent,
)


class TestPaymentLinksTDD(unittest.TestCase):
    """TDD test suite for payment link and QR generation seams."""

    # --- Vertical Slice 1: URI Scheme & Parameter URL Encoding ---

    def test_upi_deep_link_formatting_and_encoding(self):
        """URI must start with upi://pay? and encode special characters, preserving exact 2 decimal places."""
        link = generate_upi_deep_link(
            payee_vpa="alex@okaxis",
            payee_name="Alex Chen & Co",
            amount=1450.5,
            transaction_note="Flat 402 / WiFi & Electricity",
            currency="INR",
        )
        self.assertTrue(link.startswith("upi://pay?"))
        self.assertIn("pa=alex@okaxis", link)
        self.assertIn("pn=Alex%20Chen%20%26%20Co", link)
        self.assertIn("am=1450.50", link)
        self.assertIn("tn=Flat%20402%20%2F%20WiFi%20%26%20Electricity", link)
        self.assertIn("cu=INR", link)

    # --- Vertical Slice 2: Base64 QR Code Generation & PNG Bytes ---

    def test_qr_base64_generation_valid_png(self):
        """Generated QR code must be valid base64 PNG with PNG header bytes."""
        uri = "upi://pay?pa=alex@okaxis&pn=Alex&am=500.00&tn=Settlement&cu=INR"
        qr_str = generate_qr_base64(uri)
        self.assertTrue(qr_str.startswith("data:image/png;base64,"))

        # Decode base64 payload
        b64_data = qr_str.replace("data:image/png;base64,", "")
        raw_bytes = base64.b64decode(b64_data)
        # PNG signature magic bytes: 89 50 4E 47 0D 0A 1A 0A
        png_magic = b"\x89PNG\r\n\x1a\n"
        self.assertEqual(raw_bytes[:8], png_magic)

    # --- Vertical Slice 3: Offline / Missing QR Code Library Fallback ---

    @patch("backend.app.agent.tools.payment_links.HAS_QRCODE", False)
    def test_missing_qrcode_library_graceful_fallback(self):
        """When qrcode is unavailable, returns valid 1x1 transparent PNG data URI."""
        uri = "upi://pay?pa=test@upi&pn=Test&am=100.00&tn=Test&cu=INR"
        qr_str = generate_qr_base64(uri)
        self.assertTrue(qr_str.startswith("data:image/png;base64,"))
        b64_data = qr_str.replace("data:image/png;base64,", "")
        raw_bytes = base64.b64decode(b64_data)
        self.assertEqual(raw_bytes[:8], b"\x89PNG\r\n\x1a\n")

    # --- Vertical Slice 4: Strongly-Typed PaymentIntent Model Factory ---

    def test_create_payment_intent_factory(self):
        """PaymentIntent factory creates verified Pydantic model with rounded amount and attached QR."""
        intent = create_payment_intent(
            payee_vpa="priya@paytm",
            payee_name="Priya Sharma",
            amount=820.125,
            transaction_note="Groceries Split",
        )
        self.assertIsInstance(intent, PaymentIntent)
        self.assertEqual(intent.payee_vpa, "priya@paytm")
        self.assertEqual(intent.payee_name, "Priya Sharma")
        self.assertEqual(intent.amount, 820.12)
        self.assertEqual(intent.transaction_note, "Groceries Split")
        self.assertIn("pa=priya@paytm", intent.deep_link)
        self.assertIn("am=820.12", intent.deep_link)
        self.assertTrue(intent.qr_code_base64.startswith("data:image/png;base64,"))


if __name__ == "__main__":
    unittest.main()
