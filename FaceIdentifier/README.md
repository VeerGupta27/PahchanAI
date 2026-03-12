# CCTV Face Recognition — MongoDB Atlas Edition

## Project Structure

```
ai-service/
├── config.py                  # All env-var config in one place
├── api.py                     # FastAPI REST service
├── cctv_live_match.py         # Live CCTV matching loop
├── .env.example               # Copy to .env and fill in your values
├── requirements.txt
│
├── db/
│   ├── __init__.py
│   └── mongo_client.py        # MongoDB Atlas helpers
│
├── face_embedding/
│   ├── facenet_model.py       # (unchanged)
│   └── generate_embedding.py  # (unchanged)
│
├── vector_db/
│   └── faiss_index.py         # FAISS index — now backed by MongoDB
│
└── utils/
    ├── image_preprocess.py    # (unchanged)
    └── email_alert.py         # HTML email with inline images
```

---

## 1. MongoDB Atlas Setup

1. Create a free cluster at https://cloud.mongodb.com
2. Add a database user with **readWrite** on your database
3. Whitelist your IP (or use `0.0.0.0/0` for dev)
4. Copy the connection string into `.env` as `MONGODB_URI`

### Collections created automatically

| Collection          | Purpose                              |
|---------------------|--------------------------------------|
| `person_embeddings` | 512-dim FaceNet vectors + alert email |
| `persons`           | Name, profile image (base64), metadata |

---

## 2. Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password for "Mail"
4. Paste it as `EMAIL_PASSWORD` in `.env`

---

## 3. Installation

```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
```

---

## 4. Register a Person (via API)

```bash
# Start the API
uvicorn api:app --reload

# Register a person
curl -X POST http://localhost:8000/register-person \
  -F "file=@/path/to/photo.jpg" \
  -F "name=John Doe" \
  -F "reference_id=EMP-001" \
  -F "alert_email=security@yourcompany.com" \
  -F 'metadata={"department":"Engineering","badge":"A123"}'
```

The API will:
- Detect the face and generate a 512-dim embedding
- Save the embedding to `person_embeddings` in Atlas
- Save name + profile photo + metadata to `persons` in Atlas
- Reload the FAISS index automatically

---

## 5. Run Live CCTV Matching

```bash
python cctv_live_match.py
```

**Controls:**
- `q` — quit
- `r` — hot-reload embeddings from MongoDB (add new people without restarting)

**On a match:**
1. Red border + label drawn on the video feed
2. Full person record fetched from MongoDB by `reference_id`
3. HTML email sent to `alert_email` with:
   - Person details (name, metadata)
   - Live captured frame (inline)
   - Profile image from MongoDB (inline)
4. 60-second cooldown per person to avoid email spam

---

## 6. API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register-person` | Register face + save to Atlas |
| POST | `/generate-embedding` | Generate embedding (no DB write) |
| GET | `/persons` | List all registered persons |
| GET | `/persons/{ref_id}` | Get person by reference ID |
| DELETE | `/persons/{ref_id}` | Delete person + embedding |
| POST | `/reload-index` | Hot-reload FAISS index |

---

## 7. Tuning

| Config variable | Default | Effect |
|-----------------|---------|--------|
| `MATCH_THRESHOLD` | `0.7` | Lower = stricter match. Try `0.5`–`0.9` |
| `ALERT_COOLDOWN_SECONDS` | `60` | Min seconds between repeat alerts |
