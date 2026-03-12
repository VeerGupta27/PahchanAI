from fastapi import FastAPI, UploadFile, File
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


@app.post("/generate-embedding")
async def create_embedding(file: UploadFile = File(...)):

    person_id = str(uuid.uuid4())

    image_path = os.path.join(TEMP_DIR, person_id + ".jpg")

    # save uploaded image
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # generate embedding
    embedding_path = generate_embedding(image_path, person_id)

    embedding_file = os.path.basename(embedding_path)

    return {
        "person_id": person_id,
        "embedding_file": embedding_file
    }