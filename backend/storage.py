"""Bounded, transactional SQL-backed demo files with legacy read support."""
import hashlib
from pathlib import Path
from fastapi import HTTPException
from sqlalchemy import func, text
from models import DocumentContent

UPLOAD_DIRECTORY = Path(__file__).resolve().parent / 'uploads'
MAX_FILE_SIZE = 5 * 1024 * 1024
GLOBAL_LIMIT = 100 * 1024 * 1024

def detect_type(content, suffix):
    valid = {'.pdf': (b'%PDF-', 'application/pdf'), '.png': (b'\x89PNG\r\n\x1a\n', 'image/png'), '.jpg': (b'\xff\xd8\xff', 'image/jpeg'), '.jpeg': (b'\xff\xd8\xff', 'image/jpeg')}
    if suffix not in valid or not content.startswith(valid[suffix][0]):
        raise HTTPException(400, 'File contents must match the PDF, PNG or JPEG extension.')
    return valid[suffix][1]

def persist_document(db, document, content, content_type):
    if db.bind.dialect.name == 'postgresql':
        db.execute(text('SELECT pg_advisory_xact_lock(73180514)'))
    used = db.query(func.coalesce(func.sum(DocumentContent.size_bytes), 0)).scalar()
    if used + len(content) > GLOBAL_LIMIT:
        raise HTTPException(413, 'Demo storage capacity reached. Contact the administrator.')
    db.add(DocumentContent(document_id=document.id, content=content, content_type=content_type,
                           sha256=hashlib.sha256(content).hexdigest(), size_bytes=len(content)))

def read_document(db, document):
    stored = db.get(DocumentContent, document.id)
    if stored:
        return bytes(stored.content), stored.content_type
    path = UPLOAD_DIRECTORY / Path(document.stored_filename).name
    if path.is_file() and path.stat().st_size <= MAX_FILE_SIZE:
        content = path.read_bytes()
        return content, detect_type(content, path.suffix.lower())
    raise HTTPException(404, 'Original file is unavailable. Please upload the sample document again.')
