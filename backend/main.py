from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base

from routes import users
from routes import loans



# Create tables
Base.metadata.create_all(bind=engine)



app = FastAPI(
    title="SmartLoan AI",
    description="AI powered loan approval and risk prediction system"
)



# ==========================
# CORS
# ==========================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)



# ==========================
# ROUTERS
# ==========================

app.include_router(
    users.router
)


app.include_router(
    loans.router
)




@app.get("/")
def home():

    return {
        "message": "SmartLoan AI Backend Running"
    }