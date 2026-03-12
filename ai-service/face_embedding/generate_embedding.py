import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image
import numpy as np

# Face detector
mtcnn = MTCNN(image_size=160, margin=20)

# FaceNet model
model = InceptionResnetV1(pretrained='vggface2').eval()


def generate_embedding(image_path):

    img = Image.open(image_path).convert("RGB")

    face = mtcnn(img)

    if face is None:
        return None

    face = face.unsqueeze(0)

    with torch.no_grad():
        embedding = model(face)

    return embedding.numpy()[0]