from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routes import documents, loans, users

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartLoan AI",
    description="Explainable loan pre-screening and financial readiness system",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(loans.router)
app.include_router(documents.router)


@app.get("/")
def home():
    return {"message": "SmartLoan AI Backend Running"}
