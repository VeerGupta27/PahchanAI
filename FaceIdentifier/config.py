import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Atlas
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://<user>:<password>@cluster.mongodb.net/")
MONGODB_DB = os.getenv("MONGODB_DB", "surveillance_db")
EMBEDDINGS_COLLECTION = os.getenv("EMBEDDINGS_COLLECTION", "person_embeddings")
PERSONS_COLLECTION = os.getenv("PERSONS_COLLECTION", "persons")

# Email (Gmail SMTP)
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "your@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your_app_password")
EMAIL_RECIPIENT = os.getenv("EMAIL_RECIPIENT", "alert@example.com")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

# FAISS / matching
MATCH_THRESHOLD = float(os.getenv("MATCH_THRESHOLD", "0.7"))
ALERT_COOLDOWN_SECONDS = int(os.getenv("ALERT_COOLDOWN_SECONDS", "60"))
