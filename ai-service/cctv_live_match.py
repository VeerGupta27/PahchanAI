import cv2
import numpy as np
from face_embedding.generate_embedding import generate_embedding
from vector_db.faiss_index import load_embeddings, search_face

THRESHOLD = 0.7

# Load stored embeddings
load_embeddings()

# Start CCTV (webcam)
cap = cv2.VideoCapture(0)
print("CCTV system started...")

while True:

    ret, frame = cap.read()

    if not ret:
        break

    # Save frame temporarily
    temp_path = "temp_frame.jpg"
    cv2.imwrite(temp_path, frame)

    # Generate embedding
    embedding = generate_embedding(temp_path)

    if embedding is not None:

        label, distance = search_face(embedding)

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

    cv2.imshow("CCTV Surveillance", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


cap.release()
cv2.destroyAllWindows()