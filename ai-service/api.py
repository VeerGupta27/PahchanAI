from fastapi import FastAPI, UploadFile, File, HTTPException
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

    embedding = generate_embedding(image_path)

    os.remove(image_path)

    if embedding is None:
        raise HTTPException(status_code=422, detail="No face detected in image.")

    return {
        "person_id": person_id,
        "embedding": embedding.tolist()  # ← 512 numbers array
    }