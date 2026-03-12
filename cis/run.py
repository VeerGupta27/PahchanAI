"""
run.py
------
Convenience entry-point to start the CIS server.

    python run.py

Equivalent to:
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,          # hot-reload for development
        log_level="info",
    )
