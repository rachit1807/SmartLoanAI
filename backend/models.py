from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    married = Column(String, nullable=False)
    education = Column(String, nullable=False)
    employment_status = Column(String, nullable=False)
    income = Column(Float, nullable=False)
    coapplicant_income = Column(Float, default=0)
    loan_amount = Column(Float, nullable=False)
    loan_term = Column(Integer, nullable=False)
    credit_history = Column(String, nullable=False)
    property_area = Column(String, nullable=False)
    status = Column(String, default="Pending")

    approval_probability = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    financial_score = Column(Float, nullable=True)
    financial_health = Column(String, nullable=True)
    ai_reasons = Column(Text, nullable=True)
    ai_suggestions = Column(Text, nullable=True)
    monthly_emi = Column(Float, nullable=True)
    total_interest = Column(Float, nullable=True)
    total_payment = Column(Float, nullable=True)

    # Human-review workflow is kept separate from the AI prediction status.
    review_status = Column(String, default="Submitted")
    review_note = Column(Text, nullable=True)
        # Uploaded Documents
    income_report = Column(String, nullable=True)
    aadhaar = Column(String, nullable=True)
    pan = Column(String, nullable=True)
    salary_slip = Column(String, nullable=True)
    bank_statement = Column(String, nullable=True)
    photo = Column(String, nullable=True)

    # Admin Verification
    verified_by = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class LoanDocument(Base):
    __tablename__ = "loan_documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    document_type = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False)
    verification_status = Column(String, default="Pending")
    review_note = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
