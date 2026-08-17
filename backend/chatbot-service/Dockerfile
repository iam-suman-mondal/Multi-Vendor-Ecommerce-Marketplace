# =====================================================
# Stage 1: Builder
# Install all dependencies in a separate layer
# =====================================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build tools needed for some native packages (e.g. onnxruntime, grpcio)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies first (leverages Docker cache)
COPY requirement.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirement.txt


# =====================================================
# Stage 2: Runtime
# Lean Amazon Linux 2023-compatible final image
# =====================================================
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Copy application source code
COPY main_2.py .
COPY chat_bot_logic_2.py .
COPY rabbitmq_listener_2.py .
COPY knowledge_builder.py .

# ChromaDB will be built from scratch at runtime by knowledge_builder.py

# =====================================================
# Runtime Configuration
# =====================================================

# RabbitMQ host — override this at runtime via:
#   docker run -e RABBITMQ_HOST=<hostname> ...
#   or docker-compose environment section
ENV RABBITMQ_HOST=rabbitmq
ENV RABBITMQ_PORT=5672

# Groq API key — MUST be provided at runtime, do NOT bake into image
# docker run -e GROQ_API_KEY=your_key ...
ENV GROQ_API_KEY=""

# FastAPI / Uvicorn settings
ENV PORT=9099
ENV PYTHONUNBUFFERED=1

EXPOSE ${PORT}

# =====================================================
# Healthcheck (matches the /health endpoint)
# =====================================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT}/health')" || exit 1

# =====================================================
# Entrypoint
# =====================================================
CMD ["sh", "-c", "uvicorn main_2:app --host 0.0.0.0 --port ${PORT}"]
