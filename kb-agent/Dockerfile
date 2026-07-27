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

# Copy application files
COPY . .

# Expose ports: 8501 for Streamlit UI, 8000 for FastAPI REST
EXPOSE 8501 8000

# Default command starts Streamlit app
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
