import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image
import numpy as np
import os

# Resolve absolute path for embeddings folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMBEDDING_DIR = os.path.join(BASE_DIR, "embeddings")

os.makedirs(EMBEDDING_DIR, exist_ok=True)

# Face detector
mtcnn = MTCNN(image_size=160, margin=20)

# FaceNet model
model = InceptionResnetV1(pretrained='vggface2').eval()


def generate_embedding(image_path, person_id=None):

    img = Image.open(image_path).convert("RGB")

    # detect face
    face = mtcnn(img)

    if face is None:
        print("❌ No face detected in:", image_path)
        return None

    face = face.unsqueeze(0)

    with torch.no_grad():
        embedding = model(face)

    embedding = embedding.numpy()[0]

    if person_id is not None:

        save_path = os.path.join(EMBEDDING_DIR, person_id + ".npy")

        np.save(save_path, embedding)

        print("✅ Embedding saved:", save_path)

        return save_path

    return embedding