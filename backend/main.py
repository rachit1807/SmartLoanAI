import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from routes import users
from routes import loans
from routes import documents
from routes import admin

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartLoan AI",
    description="Explainable loan pre-screening and financial readiness system",
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(users.router)
app.include_router(loans.router)
app.include_router(documents.router)
app.include_router(admin.router)


@app.get("/")
def home():
    return {
        "message": "SmartLoan AI Backend Running"
    }
