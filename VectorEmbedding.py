import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image
import numpy as np
import os

EMBEDDING_DIR = "embeddings"

if not os.path.exists(EMBEDDING_DIR):
    os.makedirs(EMBEDDING_DIR)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
mtcnn = MTCNN(image_size=160, margin=20, device=device)
model = InceptionResnetV1(pretrained='vggface2').eval().to(device)


def generate_embedding(image_path, person_id=None):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    try:
        img = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(f"Cannot open image: {e}")

    face = mtcnn(img)

    if face is None:
        raise ValueError("No face detected in the image")

    face = face.unsqueeze(0).to(device)

    with torch.no_grad():
        embedding = model(face)

    embedding = embedding.cpu().numpy()[0]

    # Normalize for cosine similarity
    embedding = embedding / np.linalg.norm(embedding)

    if person_id is not None:
        save_path = os.path.join(EMBEDDING_DIR, f"{person_id}.npy")
        np.save(save_path, embedding)
        return {"status": "saved", "path": save_path, "embedding": embedding.tolist()}

    return {"status": "ok", "embedding": embedding.tolist()}
