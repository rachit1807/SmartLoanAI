from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database import SessionLocal
from models import LoanApplication, LoanDocument
from dependencies import get_current_user, require_admin, require_owner, is_admin
from fastapi.responses import Response
from storage import MAX_FILE_SIZE, detect_type, persist_document, read_document

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
    current_user = Depends(get_current_user),
):
    require_owner(current_user, user_id)
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id,
        LoanApplication.user_id == user_id,
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Loan application was not found.")

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Upload a PDF, PNG, JPG, or JPEG file only.")

    content = await file.read(MAX_FILE_SIZE + 1)
    if not content or len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Document must be between 1 byte and 5 MB.")

    content_type = detect_type(content, suffix)
    stored_filename = f"{uuid4().hex}{suffix}"

    document = LoanDocument(
        application_id=application_id,
        user_id=user_id,
        document_type=document_type,
        original_filename=file.filename,
        stored_filename=stored_filename,
        verification_status="Pending",
    )
    if application.review_status not in {'Approved', 'Rejected'}:
        application.review_status = "Under Review"
    db.add(document)
    try:
        db.flush()
        persist_document(db, document, content, content_type)
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(document)
    return {"message": "Document uploaded for review.", "document": document_response(document)}


@router.get("/user/{user_id}")
def user_documents(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    require_owner(current_user, user_id)
    documents = db.query(LoanDocument).filter(
        LoanDocument.user_id == user_id
    ).order_by(LoanDocument.uploaded_at.desc()).all()
    return [document_response(document) for document in documents]


@router.patch("/{document_id}/status", dependencies=[Depends(require_admin)])
def update_document_status(document_id: int, payload: dict, db: Session = Depends(get_db)):
    """Administrator-only update to one selected file."""
    status = payload.get("verification_status")
    if status not in {"Pending", "Approved", "Rejected"}:
        raise HTTPException(status_code=400, detail="Status must be Pending, Approved, or Rejected.")

    document = db.query(LoanDocument).filter(LoanDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document was not found.")

    document.verification_status = status
    document.review_note = payload.get("review_note")
    document.reviewed_at = datetime.utcnow() if status != "Pending" else None
    db.commit()
    db.refresh(document)
    return document_response(document)


@router.patch("/applications/{application_id}/review-status", dependencies=[Depends(require_admin)])
def update_application_review_status(application_id: int, payload: dict, db: Session = Depends(get_db)):
    """Admin/loan-officer endpoint. Add role checks before production deployment."""
    status = payload.get("review_status")
    if status not in {"Submitted", "Under Review", "Approved", "Rejected"}:
        raise HTTPException(status_code=400, detail="Invalid review status.")

    application = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Loan application was not found.")

    application.review_status = status
    application.status = status if status in {'Approved', 'Rejected'} else 'Pending Documents'
    application.review_note = payload.get("review_note")
    db.commit()
    db.refresh(application)
    return {"application_id": application.id, "review_status": application.review_status, "review_note": application.review_note}


@router.get('/{document_id}/download')
def download_document(document_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    document = db.get(LoanDocument, document_id)
    if not document:
        raise HTTPException(404, 'Document not found.')
    if not is_admin(current_user):
        require_owner(current_user, document.user_id)
    content, content_type = read_document(db, document)
    from urllib.parse import quote
    filename = quote(Path(document.original_filename).name, safe='')
    return Response(content, media_type=content_type, headers={
        'Content-Disposition': f"attachment; filename*=UTF-8''{filename}",
        'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'})
