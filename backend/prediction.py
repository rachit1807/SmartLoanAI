import math
import os

import joblib
import pandas as pd


MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml", "loan_model.pkl")
model = joblib.load(MODEL_PATH)


def calculate_financial_health(data):
    """Return a score, plain-language reasons, and useful suggestions.

    The frontend sends income and loan_amount in Indian rupees.
    """
    score = 0
    reasons = []
    suggestions = []
    income = float(data["income"])
    coapplicant_income = float(data["coapplicant_income"])
    loan_amount = float(data["loan_amount"])

    if data["credit_history"] == "Good":
        score += 35
        reasons.append("Good Credit History")
    else:
        reasons.append("Poor Credit History")
        suggestions.append("Improve your credit history")

    if income >= 25000:
        score += 20
        reasons.append("High Monthly Income")
    elif income >= 15000:
        score += 15
        reasons.append("Stable Monthly Income")
    elif income >= 8000:
        score += 10
        reasons.append("Average Monthly Income")
        suggestions.append("Increase monthly income")
    else:
        score += 5
        reasons.append("Low Monthly Income")
        suggestions.append("Increase monthly income")

    if coapplicant_income >= 5000:
        score += 10
        reasons.append("Strong Co-applicant Income")
    else:
        suggestions.append("Add a co-applicant with stable income")

    if data["education"] == "Graduate":
        score += 10
        reasons.append("Graduate Applicant")
    else:
        suggestions.append("Higher education can strengthen your profile")

    if data["employment_status"] == "Employed":
        score += 10
        reasons.append("Stable Employment")
    else:
        score += 5
        reasons.append("Self Employed")
        suggestions.append("Maintain stable business income")

    if data["married"] == "Yes":
        score += 5

    if data["property_area"] == "Urban":
        score += 5
        reasons.append("Urban Property")
    elif data["property_area"] == "Semiurban":
        score += 3
        reasons.append("Semiurban Property")

    # The original 150 limit was for a dataset expressed in thousands.
    if loan_amount <= 150000:
        score += 5
        reasons.append("Affordable Loan Amount")
    else:
        suggestions.append("Reduce the requested loan amount")

    score = min(score, 100)
    health = "Excellent" if score >= 90 else "Good" if score >= 75 else "Average" if score >= 55 else "Poor"
    return score, health, reasons, suggestions


def calculate_emi(loan_amount, months, annual_rate=10.5):
    """Calculate repayment values from a rupee principal and a term in months."""
    principal = float(loan_amount)
    term_months = int(months)
    monthly_rate = annual_rate / 1200

    if principal <= 0 or term_months <= 0:
        raise ValueError("Loan amount and loan term must be greater than zero.")

    emi = principal / term_months if monthly_rate == 0 else (
        principal * monthly_rate * math.pow(1 + monthly_rate, term_months)
        / (math.pow(1 + monthly_rate, term_months) - 1)
    )
    total_payment = emi * term_months
    total_interest = total_payment - principal
    return round(emi, 2), round(total_interest, 2), round(total_payment, 2)


def predict_loan(data):
    print("PREDICT LOAN FUNCTION CALLED")
    financial_score, financial_health, reasons, suggestions = calculate_financial_health(data)
    loan_amount_rupees = float(data["loan_amount"])

    # The trained loan dataset uses LoanAmount in thousands; the UI accepts rupees.
    input_data = {
        "Gender": 1 if data["gender"] == "Male" else 0,
        "Married": 1 if data["married"] == "Yes" else 0,
        "Dependents": 0,
        "Education": 0 if data["education"] == "Graduate" else 1,
        "Self_Employed": 1 if data["employment_status"] == "Self Employed" else 0,
        "ApplicantIncome": int(data["income"]),
        "CoapplicantIncome": int(data["coapplicant_income"]),
        "LoanAmount": loan_amount_rupees / 1000,
        "Loan_Amount_Term": int(data["loan_term"]),
        "Credit_History": 1 if data["credit_history"] == "Good" else 0,
        "Property_Area": 2 if data["property_area"] == "Urban" else 1 if data["property_area"] == "Semiurban" else 0,
    }

    dataframe = pd.DataFrame([input_data])
    prediction = model.predict(dataframe)[0]
    probabilities = model.predict_proba(dataframe)[0]
    classes = list(model.classes_)
    approved_probability = round(float(probabilities[classes.index(1)]) * 100) if 1 in classes else round(max(probabilities) * 100)

    if prediction == 1:
        status = "Approved"
        risk_level = "Low" if approved_probability >= 70 else "Medium"
    else:
        status = "Rejected"
        risk_level = "High" if approved_probability < 40 else "Medium"

    monthly_emi, total_interest, total_payment = calculate_emi(
        loan_amount_rupees, int(data["loan_term"])
    )
    print("="*60)
    print("REASONS:", reasons)
    print("SUGGESTIONS:", suggestions)
    print("="*60)
    print("===== PREDICTION OUTPUT =====")
    print(reasons)
    print(suggestions)
    return {
        "status": status,
        "approval_probability": approved_probability,
        "risk_level": risk_level,
        "financial_score": financial_score,
        "financial_health": financial_health,
        "ai_reasons": reasons,
        "ai_suggestions": suggestions,
        "monthly_emi": monthly_emi,
        "total_interest": total_interest,
        "total_payment": total_payment,
    }
