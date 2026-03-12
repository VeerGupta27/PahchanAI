from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import uuid
import os


from face_embedding.generate_embedding import generate_embedding

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp")
os.makedirs(TEMP_DIR, exist_ok=True)


@app.post("/generate-embedding")
async def create_embedding(file: UploadFile = File(...)):
    try:
        person_id = str(uuid.uuid4())
        image_path = os.path.join(TEMP_DIR, f"{person_id}.jpg")

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        embedding = generate_embedding(image_path)
        os.remove(image_path)

        if embedding is None:
            raise HTTPException(status_code=422, detail="No face detected in image.")

        return {
            "person_id": person_id,
            "embedding": embedding.tolist()
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))