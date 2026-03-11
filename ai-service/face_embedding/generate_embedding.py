import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image
import numpy as np
import os

# Face detector
mtcnn = MTCNN(image_size=160, margin=20)

# FaceNet model
model = InceptionResnetV1(pretrained='vggface2').eval()

EMBEDDING_DIR = "embeddings"

if not os.path.exists(EMBEDDING_DIR):
    os.makedirs(EMBEDDING_DIR)


def generate_embedding(image_path, person_id=None):

    img = Image.open(image_path).convert("RGB")

    # detect face
    face = mtcnn(img)

    if face is None:
        return None

    face = face.unsqueeze(0)

    with torch.no_grad():
        embedding = model(face)

    embedding = embedding.numpy()[0]

    # Save embedding only if person_id is given
    if person_id is not None:
        save_path = os.path.join(EMBEDDING_DIR, person_id + ".npy")
        np.save(save_path, embedding)
        return save_path

    # otherwise return embedding vector
    return embedding