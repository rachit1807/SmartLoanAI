from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import re
from pathlib import Path

from PyPDF2 import PdfReader

from database import SessionLocal
from models import LoanApplication, LoanDocument, User
from prediction import predict_loan

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

UPLOAD_DIRECTORY = Path(__file__).resolve().parent.parent / "uploads"


def _normalise(value):
    return re.sub(r"[^a-z0-9]", "", str(value or "").lower())


def _extract_pdf_text(path):
    try:
        reader = PdfReader(str(path))
        return " ".join((page.extract_text() or "") for page in reader.pages)[:20_000]
    except Exception:
        return ""


@router.get("/application/{application_id}/document-consistency")
def document_consistency(application_id: int, db: Session = Depends(get_db)):
    """Compare text extractable PDFs with declared data; never makes an automatic decision."""
    application = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    applicant = db.query(User).filter(User.id == application.user_id).first()
    documents = db.query(LoanDocument).filter(LoanDocument.application_id == application_id).all()
    results = []

    for document in documents:
        suffix = Path(document.stored_filename).suffix.lower()
        item = {"document_id": document.id, "document_type": document.document_type, "filename": document.original_filename, "status": "Needs review", "findings": []}
        if suffix != ".pdf":
            item["status"] = "Unsupported for text comparison"
            item["findings"].append("Only text-based PDF files can be checked in this demo. Scanned images require human review.")
            results.append(item)
            continue

        text = _extract_pdf_text(UPLOAD_DIRECTORY / document.stored_filename)
        if not text.strip():
            item["status"] = "Unreadable"
            item["findings"].append("No readable text was found. This may be a scanned PDF; review it manually.")
            results.append(item)
            continue

        checks = 0
        matches = 0
        if applicant and applicant.name:
            checks += 1
            if _normalise(applicant.name) in _normalise(text):
                matches += 1
                item["findings"].append("Applicant name appears in the document text.")
            else:
                item["findings"].append("Applicant name was not detected; confirm manually.")

        if document.document_type in {"Income Proof", "Salary Slip", "Bank Statement"}:
            checks += 1
            digits = re.sub(r"[^0-9]", "", str(int(application.income)))
            text_digits = re.sub(r"[^0-9]", "", text)
            if digits in text_digits:
                matches += 1
                item["findings"].append("Declared monthly income value appears in the document text.")
            else:
                item["findings"].append("Declared monthly income value was not detected; confirm manually.")

        item["status"] = "No automated discrepancy found" if checks and matches == checks else "Needs review"
        item["findings"].append("This comparison is advisory only. It is not fraud detection and must not determine approval automatically.")
        results.append(item)

    return {"application_id": application.id, "summary": "Automated text checks completed. A human reviewer retains the final decision.", "documents": results}


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
    documents = (
        db.query(LoanDocument)
        .filter(LoanDocument.application_id == application_id)
        .order_by(LoanDocument.uploaded_at.desc())
        .all()
    )

    return {
        "id": application.id,
        "user_id": application.user_id,
        "income": application.income,
        "loan_amount": application.loan_amount,
        "property_area": application.property_area,
        "employment_status": application.employment_status,
        "credit_history": application.credit_history,
        "status": application.status,
        "review_status": application.review_status,
        "approval_probability": application.approval_probability,
        "risk_level": application.risk_level,
        "financial_score": application.financial_score,
        "financial_health": application.financial_health,
        "ai_reasons": json.loads(application.ai_reasons) if application.ai_reasons else [],
        "ai_suggestions": json.loads(application.ai_suggestions) if application.ai_suggestions else [],
        "monthly_emi": application.monthly_emi,
        "total_interest": application.total_interest,
        "total_payment": application.total_payment,
        "documents": [
            {
                "id": document.id,
                "document_type": document.document_type,
                "original_filename": document.original_filename,
                "verification_status": document.verification_status,
                "review_note": document.review_note,
                "uploaded_at": document.uploaded_at,
            }
            for document in documents
        ],
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
