import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image
import numpy as np
import os

mtcnn = MTCNN(image_size=160, margin=20)
model = InceptionResnetV1(pretrained='vggface2').eval()

EMBEDDING_DIR = "embeddings"

if not os.path.exists(EMBEDDING_DIR):
    os.makedirs(EMBEDDING_DIR)


def generate_embedding(image_path, person_id):

    img = Image.open(image_path).convert("RGB")

    face = mtcnn(img)

    if face is None:
        return None

    face = face.unsqueeze(0)

    with torch.no_grad():
        embedding = model(face)

    embedding = embedding.numpy()[0]

    save_path = os.path.join(EMBEDDING_DIR, person_id + ".npy")

    np.save(save_path, embedding)

    return save_path