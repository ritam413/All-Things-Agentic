"""
Payment Link & QR Engine Deep Module.
Generates RFC-compliant UPI Deep Links (upi://pay) and base64 QR codes.
Zero-custody, zero-gateway liability.
"""

import sys
import urllib.parse
from pathlib import Path
import io
import base64

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import PaymentIntent

try:
    import qrcode
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False


def generate_upi_deep_link(
    payee_vpa: str,
    payee_name: str,
    amount: float,
    transaction_note: str,
    currency: str = "INR"
) -> str:
    """
    Constructs a mobile-ready UPI deep link URI string.
    Opens GPay, PhonePe, Paytm, or BHIM directly on mobile devices.
    """
    encoded_name = urllib.parse.quote(payee_name, safe="")
    encoded_note = urllib.parse.quote(transaction_note, safe="")
    formatted_amount = f"{amount:.2f}"
    
    return f"upi://pay?pa={payee_vpa}&pn={encoded_name}&am={formatted_amount}&tn={encoded_note}&cu={currency}"


def generate_qr_base64(data_uri: str) -> str:
    """
    Renders the URI string into a Base64-encoded PNG image for client-side scanning.
    """
    if not HAS_QRCODE:
        # Fallback dummy 1x1 transparent PNG data uri
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=8,
        border=2,
    )
    qr.add_data(data_uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#00F2FE", back_color="#080C14")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"


def create_payment_intent(
    payee_vpa: str,
    payee_name: str,
    amount: float,
    transaction_note: str = "RoomieOps Split Settlement"
) -> PaymentIntent:
    """
    Creates a strongly-typed PaymentIntent containing both deep link URI and QR code.
    """
    deep_link = generate_upi_deep_link(
        payee_vpa=payee_vpa,
        payee_name=payee_name,
        amount=amount,
        transaction_note=transaction_note,
    )
    qr_base64 = generate_qr_base64(deep_link)

    return PaymentIntent(
        payee_vpa=payee_vpa,
        payee_name=payee_name,
        amount=round(amount, 2),
        transaction_note=transaction_note,
        deep_link=deep_link,
        qr_code_base64=qr_base64,
    )
