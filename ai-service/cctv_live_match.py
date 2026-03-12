import cv2
import requests
import time

from face_embedding.generate_embedding import generate_embedding
from vector_db.faiss_index import load_embeddings, search_face


THRESHOLD = 0.7
ALERT_COOLDOWN = 30

# Track last alert time per suspect
last_alert_time = {}

# load embeddings initially
load_embeddings()

# start webcam
cap = cv2.VideoCapture(0)

print("CCTV system started...")

frame_count = 0


while True:

    ret, frame = cap.read()

    if not ret:
        print("Camera error")
        break

    frame_count += 1

    # reload embeddings every ~5 seconds
    if frame_count % 150 == 0:
        print("Reloading embeddings...")
        load_embeddings()

    # save frame temporarily
    temp_path = "temp_frame.jpg"
    cv2.imwrite(temp_path, frame)

    # generate embedding
    embedding = generate_embedding(temp_path)

    if embedding is not None:

        label, distance = search_face(embedding)

        if label is not None and distance is not None:

            if distance < THRESHOLD:

                text = f"ALERT: {label} detected"

                cv2.putText(
                    frame,
                    text,
                    (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 0, 255),
                    2
                )

                print("🚨 ALERT:", label, "distance:", distance)

                current_time = time.time()

                # cooldown logic
                if (
                    label not in last_alert_time
                    or current_time - last_alert_time[label] > ALERT_COOLDOWN
                ):

                    try:

                        response = requests.post(
                            "https://pahchanai.onrender.com/ai/alert",
                            json={
                                "name": label,
                                "location": "CCTV Node 1",
                                "confidence": float(distance),
                                "time": time.strftime("%Y-%m-%d %H:%M:%S")
                            }
                        )

                        print("Alert sent:", response.status_code)

                        last_alert_time[label] = current_time

                    except Exception as e:

                        print("Failed to send alert:", e)

    # show CCTV frame
    cv2.imshow("CCTV Surveillance", frame)

    # press Q to exit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


cap.release()
cv2.destroyAllWindows()