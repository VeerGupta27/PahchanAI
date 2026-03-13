import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image
import numpy as np
import os

# Face detector
mtcnn = MTCNN(image_size=160, margin=20)

# FaceNet model
model = InceptionResnetV1(pretrained='vggface2').eval()


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

    return embedding