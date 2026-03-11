from fastapi import FastAPI, UploadFile, File
import shutil
import uuid
import os
from face_embedding.generate_embedding import generate_embedding

app = FastAPI()

TEMP_DIR = "temp"

if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)


@app.post("/generate-embedding")
async def create_embedding(file: UploadFile = File(...)):

    person_id = str(uuid.uuid4())

    image_path = f"{TEMP_DIR}/{person_id}.jpg"

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    embedding_path = generate_embedding(image_path, person_id)

    return {
        "person_id": person_id,
        "embedding_path": embedding_path
    }