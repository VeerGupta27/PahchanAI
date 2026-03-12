# PahchanAI – Central Intelligence System (CIS)

> Distributed embedding circulation hub for missing-person re-identification  
> **Stack:** FastAPI · Redis Pub/Sub · PostgreSQL · FaceNet (128-D embeddings)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DISTRIBUTED CAMERA NETWORK                        │
│                                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   Node A     │    │   Node B     │    │   Node C     │               │
│  │ (CCTV cam)   │    │ (checkpoint) │    │ (station)    │               │
│  │              │    │              │    │              │               │
│  │ YOLOv8       │    │ Local vector │    │ Local vector │               │
│  │ FaceNet      │    │ DB + matcher │    │ DB + matcher │               │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘               │
│         │                   │                   │                        │
│         │ POST /circulate_embedding              │                        │
│         │                   │ subscribe         │ subscribe              │
└─────────┼───────────────────┼───────────────────┼────────────────────────┘
          │                   │                   │
          ▼                   │                   │
┌─────────────────────────────────────────────────────────────────────────┐
│              CENTRAL INTELLIGENCE SYSTEM (CIS)                           │
│                                                                           │
│  FastAPI Server                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  POST /circulate_embedding  →  CirculationService               │    │
│  │       ↓ persist CirculationLog                                  │    │
│  │       ↓ publisher.publish_embedding()                           │    │
│  │                    ↓                                            │    │
│  │             Redis Pub/Sub                                       │    │
│  │             Channel: pahchan:embeddings  ─────────────────────►│──► Nodes│
│  │                                                                 │    │
│  │  MatchResponseSubscriber                                        │    │
│  │       listens: pahchan:matches ◄────────────────────────────── Nodes│
│  │       ↓                                                         │    │
│  │  AlertService.handle_match_response()                           │    │
│  │       ↓ persist MatchEvent + Alert                              │    │
│  │       ↓ 🚨 structured alert log                                 │    │
│  │                                                                 │    │
│  │  GET  /alerts            GET /system_status                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  PostgreSQL                   Redis                                       │
│  ├── circulation_logs         ├── pahchan:embeddings (pub/sub)           │
│  ├── match_events             └── pahchan:matches    (pub/sub)           │
│  ├── alerts                                                               │
│  └── nodes                                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
central-intelligence-system/
├── app/
│   ├── main.py                   # FastAPI app factory + lifespan
│   ├── config/
│   │   └── settings.py           # Pydantic-Settings env config
│   ├── api/
│   │   └── routes.py             # All API endpoints
│   ├── services/
│   │   ├── circulation_service.py # Embedding broadcast logic
│   │   └── alert_service.py      # Match handling + alert creation
│   ├── messaging/
│   │   ├── publisher.py          # Redis PUBLISH (CIS → nodes)
│   │   └── subscriber.py        # Redis SUBSCRIBE (nodes → CIS)
│   ├── database/
│   │   ├── connection.py        # Async SQLAlchemy engine + session
│   │   └── models.py            # ORM models
│   └── utils/
│       ├── schemas.py           # Pydantic request/response models
│       └── vector_utils.py      # Cosine similarity, L2-norm helpers
├── node_simulator/
│   └── simulator.py             # Fake edge node for local testing
├── requirements.txt
├── run.py                        # uvicorn launcher
├── .env.example
└── README.md
```

---

## Prerequisites

| Service    | Version | Notes                        |
|------------|---------|------------------------------|
| Python     | ≥ 3.11  | Uses `X | Y` union syntax    |
| Redis      | ≥ 7.x   | Pub/Sub + keyspace events    |
| PostgreSQL | ≥ 15    | Async via asyncpg            |

---

## Quick Start

### 1 – Clone and create a virtual environment

```bash
cd central-intelligence-system
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2 – Configure environment

```bash
cp .env.example .env
# Edit .env with your Redis / Postgres credentials
```

### 3 – Start Redis

```bash
# macOS (Homebrew)
brew install redis && brew services start redis

# Ubuntu / Debian
sudo apt install redis-server && sudo systemctl start redis

# Docker (recommended for hackathons)
docker run -d -p 6379:6379 --name pahchan-redis redis:7-alpine
```

### 4 – Start PostgreSQL and create the database

```bash
# Docker (recommended)
docker run -d \
  -e POSTGRES_DB=pahchanai \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  --name pahchan-pg \
  postgres:15-alpine

# The CIS will create tables automatically on first run.
```

### 5 – Start the CIS server

```bash
python run.py
# → http://localhost:8000
# → Swagger UI: http://localhost:8000/docs
```

### 6 – Start one or more node simulators (separate terminals)

```bash
# Terminal 2
NODE_ID=node-alpha python -m node_simulator.simulator

# Terminal 3
NODE_ID=node-beta python -m node_simulator.simulator
```

---

## API Reference

### `POST /circulate_embedding`

Send a 128-D FaceNet embedding to the CIS for circulation.

**Request**
```json
{
  "source_node_id": "node-alpha",
  "embedding": [0.12, -0.45, 0.87, ...],   // 128 floats
  "case_id": "CASE-2024-001",               // optional
  "metadata": { "camera": "entrance-cam-3" }
}
```

**Response `202 Accepted`**
```json
{
  "circulation_id": "550e8400-e29b-41d4-a716-446655440000",
  "embedding_hash": "a3f2...",
  "recipient_count": 2,
  "status": "circulated"
}
```

---

### `POST /match_response`

Node reports a match (HTTP fallback; primary path is Redis).

```json
{
  "circulation_id": "550e8400-...",
  "reporting_node_id": "node-beta",
  "matched_person_id": "MISSING-001",
  "similarity_score": 0.912,
  "location_hint": "Gate 3, Terminal 2",
  "metadata": {}
}
```

---

### `GET /alerts`

Returns the 100 most recent alerts.

```json
[
  {
    "id": "...",
    "matched_person_id": "MISSING-001",
    "reporting_node_id": "node-beta",
    "similarity_score": 0.912,
    "location_hint": "Gate 3, Terminal 2",
    "is_resolved": false,
    "created_at": "2024-06-01T10:32:00"
  }
]
```

---

### `GET /system_status`

```json
{
  "app_name": "PahchanAI Central Intelligence System",
  "version": "1.0.0",
  "redis_embedding_channel": "pahchan:embeddings",
  "redis_match_channel": "pahchan:matches",
  "match_threshold": 0.75,
  "status": "ok"
}
```

---

## Testing the Full Flow (curl)

```bash
# 1. Generate a test embedding (128 random floats)
EMBEDDING=$(python -c "
import json
from app.utils.vector_utils import random_embedding
print(json.dumps(random_embedding(seed=42)))
")

# 2. Circulate it from a fake node
curl -s -X POST http://localhost:8000/circulate_embedding \
  -H "Content-Type: application/json" \
  -d "{
    \"source_node_id\": \"test-node\",
    \"embedding\": $EMBEDDING,
    \"case_id\": \"CASE-001\"
  }" | python -m json.tool

# 3. Watch the node_simulator terminal – it should print a match
# 4. Check alerts
curl -s http://localhost:8000/alerts | python -m json.tool
```

> **Tip:** The node simulator plants a person with `seed=42` in its local DB.
> Sending `random_embedding(seed=42)` will always produce a match.

---

## Configuration Reference (`.env`)

| Variable                  | Default               | Description                          |
|---------------------------|-----------------------|--------------------------------------|
| `DEBUG`                   | `false`               | Enable SQLAlchemy SQL echo           |
| `REDIS_HOST`              | `localhost`           | Redis hostname                       |
| `REDIS_PORT`              | `6379`                | Redis port                           |
| `REDIS_EMBEDDING_CHANNEL` | `pahchan:embeddings`  | CIS → nodes broadcast channel        |
| `REDIS_MATCH_CHANNEL`     | `pahchan:matches`     | Nodes → CIS match response channel   |
| `POSTGRES_*`              | see `.env.example`    | PostgreSQL connection params         |
| `MATCH_THRESHOLD`         | `0.75`                | Minimum cosine similarity for alert  |

---

## Scaling Notes

- **Multiple CIS instances** – run behind a load balancer; use a single Redis
  cluster so all instances share the same Pub/Sub channels.
- **Real vector search** – replace the brute-force loop in `simulator.py` with
  FAISS, pgvector, or Weaviate for O(log n) ANN search.
- **Alert delivery** – extend `AlertService._persist_and_alert()` to push
  webhooks, SMS (Twilio), or push notifications (Firebase).
- **Authentication** – add an API key middleware before the router for
  production deployments.

---

## License

MIT – built for PahchanAI hackathon.
