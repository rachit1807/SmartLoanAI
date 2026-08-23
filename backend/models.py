from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime


# User Table
class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )



# Loan Application Table
class LoanApplication(Base):
    __tablename__ = "loan_applications"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    user_id = Column(
        Integer,
        nullable=False
    )


    age = Column(
        Integer,
        nullable=False
    )


    gender = Column(
        String,
        nullable=False
    )


    married = Column(
        String,
        nullable=False
    )


    education = Column(
        String,
        nullable=False
    )


    employment_status = Column(
        String,
        nullable=False
    )


    income = Column(
        Float,
        nullable=False
    )


    coapplicant_income = Column(
        Float,
        default=0
    )


    loan_amount = Column(
        Float,
        nullable=False
    )


    loan_term = Column(
        Integer,
        nullable=False
    )


    credit_history = Column(
        Integer,
        nullable=False
    )


    property_area = Column(
        String,
        nullable=False
    )


    status = Column(
        String,
        default="Pending"
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )