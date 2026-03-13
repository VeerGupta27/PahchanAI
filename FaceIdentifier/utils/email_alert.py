"""
Email alert sender.
Sends an HTML email with:
  - Person details fetched from MongoDB
  - Profile image from DB (if available) as inline attachment
  - Live frame capture as attachment
"""

import smtplib
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from datetime import datetime
import numpy as np

from config import EMAIL_SENDER, EMAIL_PASSWORD, SMTP_HOST, SMTP_PORT


def _b64_to_bytes(b64_str: str) -> bytes | None:
    try:
        return base64.b64decode(b64_str)
    except Exception:
        return None


def send_alert_email(
    recipient: str,
    reference_id: str,
    person_data: dict | None,
    live_frame_bytes: bytes,
    match_distance: float,
):
    """
    recipient        : destination email address
    reference_id     : the matched reference ID from MongoDB
    person_data      : full person document from `persons` collection (may be None)
    live_frame_bytes : JPEG bytes of the captured frame
    match_distance   : FAISS L2 distance score
    """

    name = person_data.get("name", "Unknown") if person_data else "Unknown"
    metadata = person_data.get("metadata", {}) if person_data else {}
    db_image_b64 = person_data.get("image_base64", "") if person_data else ""
    detected_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # ── Build HTML body ─────────────────────────────────────────────────────
    meta_rows = "".join(
        f"<tr><td style='padding:4px 8px;font-weight:bold'>{k}</td>"
        f"<td style='padding:4px 8px'>{v}</td></tr>"
        for k, v in metadata.items()
    )

    html = f"""
    <html><body style="font-family:Arial,sans-serif;color:#222">
      <h2 style="color:#c0392b">🚨 CCTV Face Match Alert</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 8px;font-weight:bold">Reference ID</td>
            <td style="padding:4px 8px"><code>{reference_id}</code></td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Name</td>
            <td style="padding:4px 8px">{name}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Match Distance</td>
            <td style="padding:4px 8px">{match_distance:.4f}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Detected At</td>
            <td style="padding:4px 8px">{detected_at}</td></tr>
        {meta_rows}
      </table>

      <h3>Live Capture</h3>
      <img src="cid:live_frame" style="max-width:480px;border:2px solid #c0392b"/>
    """

    if db_image_b64:
        html += """
      <h3>Profile Image (from database)</h3>
      <img src="cid:db_image" style="max-width:240px;border:2px solid #2c3e50"/>
        """

    html += "</body></html>"

    # ── Assemble MIME message ────────────────────────────────────────────────
    msg = MIMEMultipart("related")
    msg["Subject"] = f"[ALERT] Face Match: {name} ({reference_id})"
    msg["From"] = EMAIL_SENDER
    msg["To"] = recipient

    alternative = MIMEMultipart("alternative")
    alternative.attach(MIMEText(html, "html"))
    msg.attach(alternative)

    # Live frame inline image
    live_img = MIMEImage(live_frame_bytes, _subtype="jpeg")
    live_img.add_header("Content-ID", "<live_frame>")
    live_img.add_header("Content-Disposition", "inline", filename="live_capture.jpg")
    msg.attach(live_img)

    # DB profile image (if present)
    if db_image_b64:
        db_bytes = _b64_to_bytes(db_image_b64)
        if db_bytes:
            db_img = MIMEImage(db_bytes)
            db_img.add_header("Content-ID", "<db_image>")
            db_img.add_header("Content-Disposition", "inline", filename="profile.jpg")
            msg.attach(db_img)

    # ── Send ─────────────────────────────────────────────────────────────────
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, recipient, msg.as_string())
        print(f"[Email] Alert sent to {recipient} for {reference_id}")
        return True
    except Exception as e:
        print(f"[Email] Failed to send alert: {e}")
        return False
