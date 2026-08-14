from contextlib import asynccontextmanager
from threading import Thread

# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from chat_bot_logic_2 import answer_question
from rabbitmq_listener_2 import start_rabbitmq_listener


# =====================================================
# RabbitMQ Listener Startup
# =====================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Starting IndiaMart AI Service...")

    # ---------------------------------------------
    # Start RabbitMQ listener in background thread
    # ---------------------------------------------

    rabbitmq_thread = Thread(
        target=start_rabbitmq_listener,
        daemon=True
    )

    rabbitmq_thread.start()

    print("RabbitMQ listener started")

    # ---------------------------------------------
    # FastAPI is running
    # ---------------------------------------------

    yield

    print("IndiaMart AI Service shutting down...")


# =====================================================
# FastAPI Application
# =====================================================

app = FastAPI(
    title="IndiaMart AI Service",
    version="1.0.0",
    lifespan=lifespan
)
#middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# =====================================================
# Request Model
# =====================================================

class ChatRequest(BaseModel):

    question: str


# =====================================================
# Health Check
# =====================================================

@app.get("/health")
def health():

    return {
        "status": "AI Service is running"
    }


# =====================================================
# Chat API
# =====================================================

@app.post("/chat")
def chat(request: ChatRequest):

    try:

        result = answer_question(
            request.question
        )

        return result

    except Exception as e:

        print(
            "Chat Error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )