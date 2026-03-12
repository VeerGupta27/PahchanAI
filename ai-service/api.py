from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
import shutil
import uuid
import os

from face_embedding.generate_embedding import generate_embedding

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TEMP_DIR = os.path.join(BASE_DIR, "temp")
EMBEDDING_DIR = os.path.join(BASE_DIR, "embeddings")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(EMBEDDING_DIR, exist_ok=True)

# serve embeddings folder publicly
app.mount("/embeddings", StaticFiles(directory=EMBEDDING_DIR), name="embeddings")


@app.post("/generate-embedding")
async def create_embedding(file: UploadFile = File(...)):

    person_id = str(uuid.uuid4())

    image_path = os.path.join(TEMP_DIR, person_id + ".jpg")

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    embedding = generate_embedding(image_path)

    if embedding is None:
        return {
            "success": False,
            "message": "No face detected"
        }

    return {
        "success": True,
        "person_id": person_id,
        "embedding": embedding
    }