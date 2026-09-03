FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (including poppler and tesseract for OCR fallback)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the sentence-transformers model so Render doesn't timeout on first request
# This bakes the ~80MB model into the Docker image layer
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application files
COPY . .

# Expose ports: 8501 for Streamlit UI, 8000 for FastAPI REST
EXPOSE 8501 8000

# Default command starts FastAPI REST server for Render deployment
CMD uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
