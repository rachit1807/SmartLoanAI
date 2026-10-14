"""Copy still-available legacy sample files to SQL without changing decisions.

Run BEFORE redeployment on a host that still has its original uploads directory.
Already erased files cannot be recovered by this script. Missing files are reported.
"""
from database import Base, engine, SessionLocal
from models import LoanDocument, DocumentContent
from storage import read_document, persist_document
from fastapi import HTTPException

def main():
    Base.metadata.create_all(engine)
    copied = missing = 0
    with SessionLocal() as db:
        ids = [row[0] for row in db.query(LoanDocument.id).all()]
        for identifier in ids:
            if db.get(DocumentContent, identifier):
                continue
            doc = db.get(LoanDocument, identifier)
            try:
                content, content_type = read_document(db, doc)
                persist_document(db, doc, content, content_type)
                db.commit(); copied += 1
            except HTTPException:
                db.rollback(); missing += 1
                print(f'Document {identifier}: unavailable or storage limit reached; no decision changed.')
    print(f'Copied {copied}; unavailable {missing}. Existing metadata and decisions preserved.')

if __name__ == '__main__':
    main()
