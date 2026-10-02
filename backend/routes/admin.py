from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from database import SessionLocal
from models import LoanApplication, LoanDocument
from prediction import predict_loan

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# -------------------------
# Database
# -------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Get Pending Applications
# -------------------------

@router.get("/applications")
def get_applications(db: Session = Depends(get_db)):
    return db.query(LoanApplication).all()


# -------------------------
# Verify Documents + Run AI
# -------------------------

@router.post("/verify/{application_id}")
def verify_application(
    application_id: int,
    db: Session = Depends(get_db)
):

    application = (
        db.query(LoanApplication)
        .filter(LoanApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    loan_data = {
        "age": application.age,
        "gender": application.gender,
        "married": application.married,
        "education": application.education,
        "employment_status": application.employment_status,
        "income": application.income,
        "coapplicant_income": application.coapplicant_income,
        "loan_amount": application.loan_amount,
        "loan_term": application.loan_term,
        "credit_history": application.credit_history,
        "property_area": application.property_area,
    }

    prediction = predict_loan(loan_data)

    application.status = prediction["status"]
    application.approval_probability = prediction["approval_probability"]
    application.risk_level = prediction["risk_level"]
    application.financial_score = prediction["financial_score"]
    application.financial_health = prediction["financial_health"]
   
    application.ai_reasons = json.dumps(prediction["ai_reasons"])
    application.ai_suggestions = json.dumps(prediction["ai_suggestions"])
    application.monthly_emi = prediction["monthly_emi"]
    application.total_interest = prediction["total_interest"]
    application.total_payment = prediction["total_payment"]

    db.commit()
    db.refresh(application)

    return {
        "message": "Application verified successfully",
        "application": application.id,
        "status": application.status,
        "prediction": prediction
    }
@router.get("/application/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = (
        db.query(LoanApplication)
        .filter(LoanApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    print("AI REASONS:", application.ai_reasons)
    print("AI SUGGESTIONS:", application.ai_suggestions)
    return {
    "id": application.id,
    "status": application.status,
    "approval_probability": application.approval_probability,
    "risk_level": application.risk_level,
    "financial_score": application.financial_score,
    "financial_health": application.financial_health,
    "ai_reasons": json.loads(application.ai_reasons) if application.ai_reasons else [],
    "ai_suggestions": json.loads(application.ai_suggestions) if application.ai_suggestions else [],
    "monthly_emi": application.monthly_emi,
    "total_interest": application.total_interest,
    "total_payment": application.total_payment,
}


from datetime import datetime

@router.post("/approve/{application_id}")
def approve_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = (
        db.query(LoanApplication)
        .filter(LoanApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    documents = (
        db.query(LoanDocument)
        .filter(LoanDocument.application_id == application_id)
        .all()
    )

    for document in documents:
        document.verification_status = "Approved"
        document.reviewed_at = datetime.utcnow()

    application.status = "Approved"
    application.review_status = "Approved"

    db.commit()

    return {"message": "Loan Approved"}

@router.post("/reject/{application_id}")
def reject_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = (
        db.query(LoanApplication)
        .filter(LoanApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    documents = db.query(LoanDocument).all()
    print("DOCUMENTS FOUND:", len(documents))

    for document in documents:
     document.verification_status = "Rejected"
    application.status = "Rejected"
    db.commit()

    return {"message": "Loan Rejected"}