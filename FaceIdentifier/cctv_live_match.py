"""
CCTV Live Face Matching
- Alert sent ONCE per person per session
- Press 'r' to reset alerts + reload embeddings
- Press 'q' to quit
"""

import cv2
import numpy as np
import threading

from face_embedding.generate_embedding import generate_embedding
from vector_db.faiss_index import load_embeddings_from_mongo, reload_embeddings, search_face
from db.mongo_client import fetch_person
from utils.email_alert import send_alert_email
from config import MATCH_THRESHOLD

print("[CCTV] Loading embeddings from MongoDB Atlas ...")
count = load_embeddings_from_mongo()
if count == 0:
    print("[CCTV] Warning: no embeddings loaded.")

cap = cv2.VideoCapture(0)
print("[CCTV] Camera started. Press 'q' to quit, 'r' to reset alerts & reload embeddings.")

TEMP_FRAME = "temp_frame.jpg"

# Set of reference_ids that have already been alerted — NO more alerts until reset
alerted_ids: set[str] = set()


def _encode_frame_to_jpeg(frame) -> bytes:
    success, buf = cv2.imencode(".jpg", frame)
    return buf.tobytes() if success else b""


def _send_alert_thread(reference_id, alert_email, person_data, live_jpeg, distance):
    recipient = (
        person_data.get("reporterEmail", alert_email)
        if person_data else alert_email
    )
    send_alert_email(recipient, reference_id, person_data, live_jpeg, distance)


while True:
    ret, frame = cap.read()
    if not ret:
        print("[CCTV] Failed to read frame. Exiting.")
        break

    cv2.imwrite(TEMP_FRAME, frame)
    embedding = generate_embedding(TEMP_FRAME)

    if embedding is not None:
        reference_id, distance, alert_email = search_face(embedding)

        if reference_id and distance < MATCH_THRESHOLD:

            # ── Draw alert overlay ─────────────────────────────────────────
            cv2.putText(frame, f"ALERT  dist={distance:.3f}", (30, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
            cv2.rectangle(frame, (0, 0),
                          (frame.shape[1], frame.shape[0]), (0, 0, 255), 3)

            # ── Send alert ONCE only ───────────────────────────────────────
            if reference_id not in alerted_ids:
                # Mark IMMEDIATELY before starting thread — prevents any duplicate
                alerted_ids.add(reference_id)
                print(f"[ALERT] Sending email for {reference_id}  distance={distance:.4f}")

                person_data = fetch_person(reference_id)
                live_jpeg = _encode_frame_to_jpeg(frame)

                threading.Thread(
                    target=_send_alert_thread,
                    args=(reference_id, alert_email, person_data, live_jpeg, distance),
                    daemon=True,
                ).start()
            else:
                continue

        else:
            cv2.putText(frame, "No match", (30, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 0), 2)

    cv2.imshow("CCTV Surveillance", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break
    elif key == ord("r"):
        alerted_ids.clear()
        n = reload_embeddings()
        print(f"[CCTV] Alerts reset. {n} embeddings reloaded.")

cap.release()
cv2.destroyAllWindows()
print("[CCTV] Shutdown complete.")