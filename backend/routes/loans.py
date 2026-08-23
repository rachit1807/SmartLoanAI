from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import LoanApplication

from prediction import predict_loan



router = APIRouter(
    prefix="/loans",
    tags=["Loans"]
)



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
# APPLY LOAN + ML PREDICTION
# ==========================

@router.post("/apply")
def apply_loan(
    loan_data: dict,
    db: Session = Depends(get_db)
):

    try:


        # ML prediction

        prediction = predict_loan(
            loan_data
        )




        # Save application

        new_application = LoanApplication(

            user_id=loan_data["user_id"],

            age=loan_data["age"],

            gender=loan_data["gender"],

            married=loan_data["married"],

            education=loan_data["education"],

            employment_status=
            loan_data["employment_status"],

            income=loan_data["income"],

            coapplicant_income=
            loan_data["coapplicant_income"],

            loan_amount=
            loan_data["loan_amount"],

            loan_term=
            loan_data["loan_term"],

            credit_history=
            loan_data["credit_history"],

            property_area=
            loan_data["property_area"],

            status=
            prediction["status"]

        )



        db.add(new_application)

        db.commit()

        db.refresh(new_application)




        return {


            "message":
            "Loan prediction completed",


            "application_id":
            new_application.id,


            "status":
            prediction["status"],


            "approval_probability":
            prediction["approval_probability"],


            "risk_level":
            prediction["risk_level"]

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

    user_id:int,

    db:Session = Depends(get_db)

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



    approved = len(

        [

            app

            for app in applications

            if app.status == "Approved"

        ]

    )



    rejected = len(

        [

            app

            for app in applications

            if app.status == "Rejected"

        ]

    )



    pending = len(

        [

            app

            for app in applications

            if app.status == "Pending"

        ]

    )





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

    }# ==========================
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