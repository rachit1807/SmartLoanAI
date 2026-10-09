from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import LoanApplication
from prediction import predict_loan

router = APIRouter(
    prefix="/loans",
    tags=["Loans"]
)


def validate_simulation_input(data):
    """Validate a non-persistent affordability simulation request."""
    required = {
        "age", "gender", "married", "education", "employment_status", "income",
        "coapplicant_income", "loan_amount", "loan_term", "credit_history", "property_area",
    }
    missing = [field for field in required if data.get(field) in (None, "")]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing required fields: {', '.join(missing)}")

    try:
        age = int(data["age"])
        income = float(data["income"])
        co_income = float(data["coapplicant_income"])
        amount = float(data["loan_amount"])
        term = int(data["loan_term"])
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="Age, income, loan amount, and term must be valid numbers.")

    if not 18 <= age <= 100:
        raise HTTPException(status_code=422, detail="Age must be between 18 and 100.")
    if income < 0 or co_income < 0 or not 1_000 <= amount <= 10_000_000 or not 6 <= term <= 480:
        raise HTTPException(status_code=422, detail="Use non-negative income, a loan amount from ₹1,000 to ₹1,00,00,000, and a term from 6 to 480 months.")


@router.post("/simulate")
def simulate_loan(loan_data: dict):
    """Run an explanatory, non-persistent eligibility and repayment simulation."""
    validate_simulation_input(loan_data)
    try:
        result = predict_loan(loan_data)
        result.update({
            "simulation": True,
            "simulation_notice": "This is an educational AI pre-screening estimate. It does not submit an application, guarantee approval, or replace a bank's final decision.",
            "model_limitations": [
                "The result depends only on the fields entered and the project training data.",
                "A bank or authorised reviewer makes the final approval decision after document and policy checks.",
            ],
        })
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="The simulation could not be calculated. Please try again.")


# ==========================
# DATABASE CONNECTION
# ==========================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================
# APPLY LOAN
# ==========================

@router.post("/apply")
def apply_loan(
    loan_data: dict,
    db: Session = Depends(get_db)
):
    try:

        new_application = LoanApplication(
            user_id=loan_data["user_id"],
            age=loan_data["age"],
            gender=loan_data["gender"],
            married=loan_data["married"],
            education=loan_data["education"],
            employment_status=loan_data["employment_status"],
            income=loan_data["income"],
            coapplicant_income=loan_data["coapplicant_income"],
            loan_amount=loan_data["loan_amount"],
            loan_term=loan_data["loan_term"],
            credit_history=loan_data["credit_history"],
            property_area=loan_data["property_area"],

            # Don't run AI here
            status="Pending Documents"
        )

        db.add(new_application)
        db.commit()
        db.refresh(new_application)

        return {
            "message": "Loan application submitted successfully.",
            "application_id": new_application.id,
            "status": "Pending Documents"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
      


# ==========================
# LOAN HISTORY
# ==========================

@router.get("/history/{user_id}")
def loan_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    applications = db.query(
        LoanApplication
    ).filter(
        LoanApplication.user_id == user_id
    ).all()

    return applications


# ==========================
# DASHBOARD STATS
# ==========================

@router.get("/dashboard/{user_id}")
def dashboard_stats(
    user_id: int,
    db: Session = Depends(get_db)
):

    applications = db.query(
        LoanApplication
    ).filter(
        LoanApplication.user_id == user_id
    ).all()

    total_loans = len(applications)

    approved = len([
        app for app in applications
        if app.status == "Approved"
    ])

    rejected = len([
        app for app in applications
        if app.status == "Rejected"
    ])

    pending = len([
        app for app in applications
        if app.status == "Pending"
    ])

    if total_loans > 0:
        approval_percentage = round(
            (approved / total_loans) * 100
        )
    else:
        approval_percentage = 0

    if approval_percentage >= 70:
        risk_level = "Low"
    elif approval_percentage >= 40:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {

        "total_loans": total_loans,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "approval_percentage": approval_percentage,
        "risk_level": risk_level

    }


# ==========================
# RECENT LOANS
# ==========================

@router.get("/recent/{user_id}")
def recent_loans(
    user_id: int,
    db: Session = Depends(get_db)
):

    applications = db.query(
        LoanApplication
    ).filter(
        LoanApplication.user_id == user_id
    ).order_by(
        LoanApplication.id.desc()
    ).limit(5).all()

    recent = []

    for app in applications:

        recent.append({

            "id": app.id,
            "loan_amount": app.loan_amount,
            "income": app.income,
            "status": app.status,
            "created_at": app.created_at

        })

    return recent
