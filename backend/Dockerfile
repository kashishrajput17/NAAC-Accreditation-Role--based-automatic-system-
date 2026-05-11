FROM python:3.11-slim

WORKDIR /app

# Install dependencies needed for reportlab (e.g., fonts, freetype)
RUN apt-get update && apt-get install -y \
    build-essential \
    libfreetype6-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Expose port 5000
EXPOSE 5000

# Copy application files
COPY . .

# Run the WSGI server
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
