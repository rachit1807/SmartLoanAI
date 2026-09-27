from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database import SessionLocal
from models import LoanApplication, LoanDocument

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIRECTORY = Path(__file__).resolve().parent.parent / "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 5 * 1024 * 1024


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def document_response(document):
    return {
        "id": document.id,
        "application_id": document.application_id,
        "document_type": document.document_type,
        "original_filename": document.original_filename,
        "verification_status": document.verification_status,
        "review_note": document.review_note,
        "uploaded_at": document.uploaded_at,
        "reviewed_at": document.reviewed_at,
    }


@router.post("/upload")
async def upload_document(
    application_id: int = Form(...),
    user_id: int = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id,
        LoanApplication.user_id == user_id,
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Loan application was not found.")

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Upload a PDF, PNG, JPG, or JPEG file only.")

    content = await file.read()
    if not content or len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Document must be between 1 byte and 5 MB.")

    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    stored_filename = f"{uuid4().hex}{suffix}"
    (UPLOAD_DIRECTORY / stored_filename).write_bytes(content)

    document = LoanDocument(
        application_id=application_id,
        user_id=user_id,
        document_type=document_type,
        original_filename=file.filename,
        stored_filename=stored_filename,
        verification_status="Pending",
    )
    application.review_status = "Under Review"
    db.add(document)
    db.commit()
    db.refresh(document)
    return {"message": "Document uploaded for review.", "document": document_response(document)}


@router.get("/user/{user_id}")
def user_documents(user_id: int, db: Session = Depends(get_db)):
    documents = db.query(LoanDocument).filter(
        LoanDocument.user_id == user_id
    ).order_by(LoanDocument.uploaded_at.desc()).all()
    return [document_response(document) for document in documents]


@router.patch("/{document_id}/status")
def update_document_status(document_id: int, payload: dict, db: Session = Depends(get_db)):
    """Admin/loan-officer endpoint. Add authentication before production deployment."""
    status = payload.get("verification_status")
    if status not in {"Pending", "Verified", "Rejected"}:
        raise HTTPException(status_code=400, detail="Status must be Pending, Verified, or Rejected.")

    document = db.query(LoanDocument).filter(LoanDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document was not found.")

    document.verification_status = status
    document.review_note = payload.get("review_note")
    document.reviewed_at = datetime.utcnow() if status != "Pending" else None
    db.commit()
    db.refresh(document)
    return document_response(document)


@router.patch("/applications/{application_id}/review-status")
def update_application_review_status(application_id: int, payload: dict, db: Session = Depends(get_db)):
    """Admin/loan-officer endpoint. Add role checks before production deployment."""
    status = payload.get("review_status")
    if status not in {"Submitted", "Under Review", "Approved", "Rejected"}:
        raise HTTPException(status_code=400, detail="Invalid review status.")

    application = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Loan application was not found.")

    application.review_status = status
    application.review_note = payload.get("review_note")
    db.commit()
    db.refresh(application)
    return {"application_id": application.id, "review_status": application.review_status, "review_note": application.review_note}
